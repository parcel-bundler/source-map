class Base64Decoder {
public:
    Base64Decoder() {
        for (int i = 0; i < 256; ++i) table[i] = -1;
        for (unsigned char i = '0'; i <= '9'; ++i) table[i] = 52 + i - '0';
        for (unsigned char i = 'A'; i <= 'Z'; ++i) table[i] = i - 'A';
        for (unsigned char i = 'a'; i <= 'z'; ++i) table[i] = 26 + i - 'a';
        table[(unsigned char) '+'] = 62;
        table[(unsigned char) '/'] = 63;
    }

    int decode(unsigned char i) {
        return this->table[i];
    }

private:
    signed char table[256];
};
