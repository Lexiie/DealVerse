import { createQrPayload, encodeQrPayload, decodeQrPayload, isQrPayloadValid } from '../qr';

describe('QR helpers', () => {
  it('round-trips payload encoding and decoding', () => {
    const payload = createQrPayload({
      dealId: 'deal-123',
      couponMint: 'mint-abc',
      owner: 'owner-xyz',
      ttlMs: 1000
    });

    const encoded = encodeQrPayload(payload);
    const decoded = decodeQrPayload(encoded);

    expect(decoded).toMatchObject({
      dealId: 'deal-123',
      couponMint: 'mint-abc',
      owner: 'owner-xyz'
    });
    expect(isQrPayloadValid(decoded)).toBe(true);
  });
});
