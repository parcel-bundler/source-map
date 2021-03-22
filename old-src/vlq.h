#include <vector>
#include <sstream>

#define VLQ_BASE_SHIFT 5
#define VLQ_BASE (1 << VLQ_BASE_SHIFT)
#define VLQ_BASE_MASK (VLQ_BASE - 1)
#define VLQ_CONTINUATION_BIT VLQ_BASE

#define BASE64_ENCODE_TABLE "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
static signed char _base64_decode_table[] = {-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                             -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
                                             -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60,
                                             61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                                             13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1,
                                             26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
                                             45, 46, 47, 48, 49, 50, 51};

bool isBase64(unsigned char c) {
    return (isalnum(c) || (c == '+') || (c == '/'));
}

int decodeBase64Char(unsigned char c) {
    return _base64_decode_table[c];
}

void encodeVlq(int i, std::ostream &os) {
    int vlq = (i < 0) ? ((-i) << 1) + 1 : (i << 1) + 0;
    do {
        int digit = vlq & VLQ_BASE_MASK;
        vlq >>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
        }
        os.put(BASE64_ENCODE_TABLE[digit]);
    } while (vlq > 0);
}
