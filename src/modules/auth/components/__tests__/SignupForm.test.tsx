import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '../SignupForm';
import { sendOTP } from '../../actions/sendOTP';
import { verifyOTPAction } from '../../actions/verifyOTP';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('../../actions/sendOTP');
jest.mock('../../actions/verifyOTP');
jest.mock('next-auth/react');
jest.mock('next/navigation');

const mockSendOTP = sendOTP as jest.MockedFunction<typeof sendOTP>;
const mockVerifyOTP = verifyOTPAction as jest.MockedFunction<typeof verifyOTPAction>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockPush = jest.fn();

describe('SignupForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    describe('Phone Input Step', () => {
        it('should render phone input form', () => {
            render(<SignupForm />);

            expect(screen.getByText('Sign Up')).toBeInTheDocument();
            expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
        });

        it('should show progress indicator on step 1', () => {
            render(<SignupForm />);

            const progressDots = screen.getAllByRole('generic').filter(el =>
                el.className.includes('rounded-full')
            );
            expect(progressDots.length).toBeGreaterThan(0);
        });

        it('should display trust messaging', () => {
            render(<SignupForm />);

            expect(screen.getByText(/keeps your account safe/i)).toBeInTheDocument();
        });

        it('should send OTP when form is submitted', async () => {
            mockSendOTP.mockResolvedValue({ success: true, message: 'OTP sent' });

            render(<SignupForm />);

            const phoneInput = screen.getByLabelText(/phone number/i);
            const submitButton = screen.getByRole('button', { name: /send otp/i });

            await userEvent.type(phoneInput, '0812345678');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSendOTP).toHaveBeenCalledWith({ phone: '0812345678' });
            });
        });

        it('should show error message on failed OTP send', async () => {
            mockSendOTP.mockResolvedValue({ success: false, error: 'Failed to send OTP' });

            render(<SignupForm />);

            const phoneInput = screen.getByLabelText(/phone number/i);
            const submitButton = screen.getByRole('button', { name: /send otp/i });

            await userEvent.type(phoneInput, '0812345678');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/failed to send otp/i)).toBeInTheDocument();
            });
        });

        it('should move to OTP step on successful send', async () => {
            mockSendOTP.mockResolvedValue({ success: true, message: 'OTP sent' });

            render(<SignupForm />);

            const phoneInput = screen.getByLabelText(/phone number/i);
            const submitButton = screen.getByRole('button', { name: /send otp/i });

            await userEvent.type(phoneInput, '0812345678');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/verify otp/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
            });
        });
    });

    describe('OTP Verification Step', () => {
        beforeEach(async () => {
            mockSendOTP.mockResolvedValue({ success: true, message: 'OTP sent' });

            render(<SignupForm />);

            const phoneInput = screen.getByLabelText(/phone number/i);
            const submitButton = screen.getByRole('button', { name: /send otp/i });

            await userEvent.type(phoneInput, '0812345678');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/verify otp/i)).toBeInTheDocument();
            });
        });

        it('should render OTP input form', () => {
            expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /verify & sign up/i })).toBeInTheDocument();
        });

        it('should only allow numeric input', async () => {
            const otpInput = screen.getByLabelText(/verification code/i) as HTMLInputElement;

            await userEvent.type(otpInput, 'abc123');

            expect(otpInput.value).toBe('123');
        });

        it('should limit OTP to 6 digits', async () => {
            const otpInput = screen.getByLabelText(/verification code/i) as HTMLInputElement;

            await userEvent.type(otpInput, '1234567890');

            expect(otpInput.value).toBe('123456');
        });

        it('should verify OTP and sign in on submit', async () => {
            mockVerifyOTP.mockResolvedValue({
                success: true,
                userId: 'user123',
                verificationStatus: 'UNVERIFIED'
            });
            mockSignIn.mockResolvedValue({ ok: true } as any);

            const otpInput = screen.getByLabelText(/verification code/i);
            const submitButton = screen.getByRole('button', { name: /verify & sign up/i });

            await userEvent.type(otpInput, '123456');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(mockVerifyOTP).toHaveBeenCalledWith({
                    phone: '0812345678',
                    code: '123456'
                });
                expect(mockSignIn).toHaveBeenCalledWith('phone-otp', {
                    phone: '0812345678',
                    code: '123456',
                    redirect: false,
                });
                expect(mockPush).toHaveBeenCalledWith('/');
            });
        });

        it('should show error on invalid OTP', async () => {
            mockVerifyOTP.mockResolvedValue({ success: false, error: 'Invalid OTP code' });

            const otpInput = screen.getByLabelText(/verification code/i);
            const submitButton = screen.getByRole('button', { name: /verify & sign up/i });

            await userEvent.type(otpInput, '123456');
            await userEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/invalid otp code/i)).toBeInTheDocument();
            });
        });

        it('should allow going back to phone input', async () => {
            const backButton = screen.getByRole('button', { name: /change phone number/i });

            await userEvent.click(backButton);

            expect(screen.getByText('Sign Up')).toBeInTheDocument();
            expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        });

        it('should disable submit button until 6 digits entered', () => {
            const submitButton = screen.getByRole('button', { name: /verify & sign up/i });

            expect(submitButton).toBeDisabled();
        });

        it('should enable submit button when 6 digits entered', async () => {
            const otpInput = screen.getByLabelText(/verification code/i);
            const submitButton = screen.getByRole('button', { name: /verify & sign up/i });

            await userEvent.type(otpInput, '123456');

            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('Touch Target Accessibility', () => {
        it('should have minimum 44px touch targets for buttons', () => {
            render(<SignupForm />);

            const submitButton = screen.getByRole('button', { name: /send otp/i });
            const styles = window.getComputedStyle(submitButton);

            // Check inline styles (we set minHeight: 44px)
            expect(submitButton.style.minHeight).toBe('44px');
            expect(submitButton.style.minWidth).toBe('44px');
        });
    });
});
