/**
 * maskImage.test.ts
 *
 * Unit tests for the `maskIdCardImage` utility (Story 1.4).
 *
 * jsdom does not implement `createImageBitmap` or `HTMLCanvasElement.toBlob`,
 * so we provide minimal mocks that are sufficient for unit-testing the logic.
 */

import { maskIdCardImage, MASK_RATIO } from "../maskImage";

// ---------------------------------------------------------------------------
// Helpers & mocks
// ---------------------------------------------------------------------------

const MOCK_WIDTH = 800;
const MOCK_HEIGHT = 500;

/** Minimal ImageBitmap mock */
function makeMockBitmap(): ImageBitmap {
    return {
        width: MOCK_WIDTH,
        height: MOCK_HEIGHT,
        close: jest.fn(),
    } as unknown as ImageBitmap;
}

/** Create a fake 1×1 JPEG Blob (canvas.toBlob result) */
function fakeJpegBlob(): Blob {
    return new Blob(["fake-jpeg-data"], { type: "image/jpeg" });
}

// jsdom stubs -----------------------------------------------------------------

let mockFillRect: jest.Mock;
let mockDrawImage: jest.Mock;
let mockFillStyleSetter: jest.Mock;

beforeEach(() => {
    // Reset mocks
    mockFillRect = jest.fn();
    mockDrawImage = jest.fn();
    mockFillStyleSetter = jest.fn();

    // Mock createImageBitmap
    (global as unknown as Record<string, unknown>).createImageBitmap = jest
        .fn()
        .mockResolvedValue(makeMockBitmap());

    // Mock HTMLCanvasElement.prototype.getContext
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        drawImage: mockDrawImage,
        fillRect: mockFillRect,
        set fillStyle(_v: string) {
            mockFillStyleSetter(_v);
        },
        get fillStyle() {
            return "#000000";
        },
    } as unknown as CanvasRenderingContext2D);

    // Mock HTMLCanvasElement.prototype.toBlob
    jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
        function (callback: BlobCallback) {
            callback(fakeJpegBlob());
        },
    );
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("maskIdCardImage", () => {
    it("returns a File object", async () => {
        const input = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
        const result = await maskIdCardImage(input);
        expect(result).toBeInstanceOf(File);
    });

    it("preserves the original file name", async () => {
        const input = new File(["dummy"], "my-id-card.jpg", { type: "image/jpeg" });
        const result = await maskIdCardImage(input);
        expect(result.name).toBe("my-id-card.jpg");
    });

    it("result type is image/jpeg", async () => {
        const input = new File(["dummy"], "id.png", { type: "image/png" });
        const result = await maskIdCardImage(input);
        expect(result.type).toBe("image/jpeg");
    });

    it("calls fillRect covering the bottom MASK_RATIO of the image", async () => {
        const input = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
        await maskIdCardImage(input);

        expect(mockFillRect).toHaveBeenCalledTimes(1);

        const [x, y, w, h] = mockFillRect.mock.calls[0] as [
            number,
            number,
            number,
            number,
        ];

        const expectedMaskHeight = Math.round(MOCK_HEIGHT * MASK_RATIO);

        expect(x).toBe(0);
        expect(y).toBe(MOCK_HEIGHT - expectedMaskHeight);
        expect(w).toBe(MOCK_WIDTH);
        expect(h).toBe(expectedMaskHeight);
    });

    it("draws the original image onto the canvas before masking", async () => {
        const input = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
        await maskIdCardImage(input);

        // drawImage must be called before fillRect
        expect(mockDrawImage).toHaveBeenCalledTimes(1);
        const drawOrder = mockDrawImage.mock.invocationCallOrder[0];
        const fillOrder = mockFillRect.mock.invocationCallOrder[0];
        expect(drawOrder).toBeLessThan(fillOrder!);
    });

    it("closes the ImageBitmap to free GPU memory", async () => {
        const bitmap = makeMockBitmap();
        (global as unknown as Record<string, unknown>).createImageBitmap = jest
            .fn()
            .mockResolvedValue(bitmap);

        const input = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
        await maskIdCardImage(input);

        expect(bitmap.close).toHaveBeenCalledTimes(1);
    });

    it("throws if canvas context is unavailable", async () => {
        jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

        const input = new File(["dummy"], "id.jpg", { type: "image/jpeg" });
        await expect(maskIdCardImage(input)).rejects.toThrow(
            "unable to get 2D canvas context",
        );
    });
});
