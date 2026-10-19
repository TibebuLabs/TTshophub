export interface EthiopianBank {
  id: string;
  name: string;
  nameAm: string;
  shortName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  color: string;
  bgLight: string;
}

export interface WalletOption {
  id: string;
  type: string;
  name: string;
  amharic: string;
  shortCode: string;
  placeholder: string;
  color: string;
  note: string;
}

export const ETHIOPIAN_BANKS: EthiopianBank[] = [
  {
    id: 'cbe',
    name: 'Commercial Bank of Ethiopia (CBE)',
    nameAm: 'የኢትዮጵያ ንግድ ባንክ',
    shortName: 'CBE',
    accountNumber: '1000184729482',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Addis Ababa Finfine Branch',
    color: '#6B2C83',
    bgLight: '#F5ECF8',
  },
  {
    id: 'awash',
    name: 'Awash Bank',
    nameAm: 'አዋሽ ባንክ',
    shortName: 'Awash',
    accountNumber: '01320492817200',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Bole Medhanialem Branch',
    color: '#0055A5',
    bgLight: '#E8F2FA',
  },
  {
    id: 'abyssinia',
    name: 'Bank of Abyssinia (BoA)',
    nameAm: 'የአቢሲንያ ባንክ',
    shortName: 'Abyssinia',
    accountNumber: '8492019482',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Legehar Central Branch',
    color: '#B38E33',
    bgLight: '#FCF8EE',
  },
  {
    id: 'dashen',
    name: 'Dashen Bank',
    nameAm: 'ዳሽን ባንክ',
    shortName: 'Dashen',
    accountNumber: '502948192014',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Kazanchis Branch',
    color: '#003366',
    bgLight: '#EBF2F8',
  },
  {
    id: 'coop',
    name: 'Cooperative Bank of Oromia (Coop)',
    nameAm: 'የኦሮሚያ ህብረት ሥራ ባንክ',
    shortName: 'Coop Bank',
    accountNumber: '1000049281927',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Olympia Branch',
    color: '#D32F2F',
    bgLight: '#FDF0F0',
  },
  {
    id: 'wegagen',
    name: 'Wegagen Bank',
    nameAm: 'ወጋገን ባንክ',
    shortName: 'Wegagen',
    accountNumber: '092837194820',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Ras Mekonnen Branch',
    color: '#E65100',
    bgLight: '#FDF2EB',
  },
  {
    id: 'hibret',
    name: 'Hibret Bank (United Bank)',
    nameAm: 'ኅብረት ባንክ',
    shortName: 'Hibret',
    accountNumber: '119284729103',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Hiber Tower Branch',
    color: '#0288D1',
    bgLight: '#E6F4FA',
  },
  {
    id: 'nib',
    name: 'Nib International Bank',
    nameAm: 'ንብ ኢንተርናሽናል ባንክ',
    shortName: 'Nib',
    accountNumber: '700019283741',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Sengatera Branch',
    color: '#F57C00',
    bgLight: '#FEF4E8',
  },
  {
    id: 'zemen',
    name: 'Zemen Bank',
    nameAm: 'ዘመን ባንክ',
    shortName: 'Zemen',
    accountNumber: '102938475619',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Joseph Tito St Branch',
    color: '#37474F',
    bgLight: '#ECEFF1',
  },
  {
    id: 'oromia',
    name: 'Oromia Bank',
    nameAm: 'ኦሮሚያ ባንክ',
    shortName: 'Oromia',
    accountNumber: '100293847562',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Africa Avenue Branch',
    color: '#1B5E20',
    bgLight: '#E8F5E9',
  },
  {
    id: 'bunna',
    name: 'Bunna International Bank',
    nameAm: 'ቡና ኢንተርናሽናል ባንክ',
    shortName: 'Bunna',
    accountNumber: '200192837465',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Arat Kilo Branch',
    color: '#4E342E',
    bgLight: '#EFEBE9',
  },
  {
    id: 'berhan',
    name: 'Berhan Bank',
    nameAm: 'ብርሃን ባንክ',
    shortName: 'Berhan',
    accountNumber: '300192837461',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Bole Medhanialem Branch',
    color: '#C2185B',
    bgLight: '#FCE4EC',
  },
  {
    id: 'abay',
    name: 'Abay Bank',
    nameAm: 'አባይ ባንክ',
    shortName: 'Abay',
    accountNumber: '400192837462',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Meskel Flower Branch',
    color: '#00796B',
    bgLight: '#E0F2F1',
  },
  {
    id: 'addis',
    name: 'Addis International Bank',
    nameAm: 'አዲስ ኢንተርናሽናል ባንክ',
    shortName: 'Addis',
    accountNumber: '500192837463',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Mexico Square Branch',
    color: '#512DA8',
    bgLight: '#EDE7F6',
  },
  {
    id: 'enat',
    name: 'Enat Bank',
    nameAm: 'እናት ባንክ',
    shortName: 'Enat',
    accountNumber: '600192837464',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Kazanchis Enat Tower',
    color: '#880E4F',
    bgLight: '#FCE4EC',
  },
  {
    id: 'global',
    name: 'Global Bank Ethiopia',
    nameAm: 'ግሎባል ባንክ ኢትዮጵያ',
    shortName: 'Global',
    accountNumber: '700192837465',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Gotera Branch',
    color: '#1565C0',
    bgLight: '#E3F2FD',
  },
  {
    id: 'lion',
    name: 'Lion International Bank',
    nameAm: 'አንበሳ ኢንተርናሽናል ባንክ',
    shortName: 'Lion',
    accountNumber: '800192837466',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Haile G/Selassie St Branch',
    color: '#AFB42B',
    bgLight: '#F9FBE7',
  },
  {
    id: 'sinqee',
    name: 'Sinqee Bank',
    nameAm: 'ሲንቄ ባንክ',
    shortName: 'Sinqee',
    accountNumber: '900192837467',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Oda Tower Branch',
    color: '#2E7D32',
    bgLight: '#E8F5E9',
  },
  {
    id: 'tsedey',
    name: 'Tsedey Bank',
    nameAm: 'ፀደይ ባንክ',
    shortName: 'Tsedey',
    accountNumber: '110192837468',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Addis Ababa Branch',
    color: '#558B2F',
    bgLight: '#F1F8E9',
  },
  {
    id: 'amhara',
    name: 'Amhara Bank',
    nameAm: 'አማራ ባንክ',
    shortName: 'Amhara',
    accountNumber: '120192837469',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Legehar Branch',
    color: '#00695C',
    bgLight: '#E0F2F1',
  },
  {
    id: 'gadaa',
    name: 'Gadaa Bank',
    nameAm: 'ገዳ ባንክ',
    shortName: 'Gadaa',
    accountNumber: '130192837470',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Bole Branch',
    color: '#BF360C',
    bgLight: '#FBE9E7',
  },
  {
    id: 'hijra',
    name: 'Hijra Bank (Interest-Free)',
    nameAm: 'ሂጅራ ባንክ (ከወለድ ነፃ)',
    shortName: 'Hijra',
    accountNumber: '140192837471',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Kirkos Branch',
    color: '#004D40',
    bgLight: '#E0F2F1',
  },
  {
    id: 'zamzam',
    name: 'ZamZam Bank (Interest-Free)',
    nameAm: 'ዘምዘም ባንክ (ከወለድ ነፃ)',
    shortName: 'ZamZam',
    accountNumber: '150192837472',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Bole Michael Branch',
    color: '#1A237E',
    bgLight: '#E8EAF6',
  },
  {
    id: 'rammis',
    name: 'Rammis Bank (Interest-Free)',
    nameAm: 'ራሚስ ባንክ (ከወለድ ነፃ)',
    shortName: 'Rammis',
    accountNumber: '160192837473',
    accountName: 'ShopHub / NileMart Trading PLC',
    branch: 'Meskel Square Branch',
    color: '#33691E',
    bgLight: '#F1F8E9',
  },
];

export const WALLETS: WalletOption[] = [
  {
    id: 'telebirr',
    type: 'telebirr',
    name: 'Telebirr',
    amharic: 'ቴሌብር',
    shortCode: '*127#',
    placeholder: '0911223344 or 07...',
    color: '#0A7BA8',
    note: 'We’ll trigger a USSD push to this number. Open Telebirr or dial *127#, check the amount and approve with your PIN.',
  },
  {
    id: 'cbe',
    type: 'cbebirr',
    name: 'CBE Birr',
    amharic: 'ሲቢኢ ብር',
    shortCode: '*847#',
    placeholder: '0911223344',
    color: '#6B2C83',
    note: 'Commercial Bank of Ethiopia will send an approval prompt. Confirm the debit using your CBE Birr PIN.',
  },
  {
    id: 'mpesa',
    type: 'mpesa',
    name: 'M-Pesa Safaricom',
    amharic: 'ኤም-ፔሳ ሳፋሪኮም',
    shortCode: '*733#',
    placeholder: '0711223344',
    color: '#2E9B3E',
    note: 'Safaricom M-Pesa push prompt will appear on your phone screen. Enter your M-Pesa PIN to complete checkout.',
  },
  {
    id: 'ebirr',
    type: 'ebirr',
    name: 'eBirr',
    amharic: 'ኢ-ብር',
    shortCode: '*841#',
    placeholder: '0911223344',
    color: '#0E8A4B',
    note: 'An instant eBirr payment authorization will be sent to your mobile wallet. Approve with your secret PIN.',
  },
];

export const MERCHANT_INFO = {
  name: 'ShopHub NileMart',
  tin: '0092837419',
  phone: '+251 91 123 4567',
  email: 'orders@shophub.et',
  address: 'Bole Medhanialem, Edna Mall Tower 4th Floor, Addis Ababa, Ethiopia',
  vatRate: 0.15,
};

export class PaymentClientService {
  /**
   * Validate Ethiopian phone numbers (09... or 07... 10 digits)
   */
  static isValidPhone(phone: string): boolean {
    const clean = phone.replace(/[\s-]/g, '').replace(/^\+251/, '0');
    return /^(09|07)\d{8}$/.test(clean);
  }

  /**
   * Standardizes phone format to 09XXXXXXXX
   */
  static cleanPhone(phone: string): string {
    return phone.replace(/[\s-]/g, '').replace(/^\+251/, '0');
  }

  /**
   * Mask phone for secure USSD confirmation view: 09•• ••• 44
   */
  static maskPhone(phone: string): string {
    const clean = this.cleanPhone(phone);
    return clean.replace(/^(\d{2})\d{5}(\d{3})$/, '$1•• ••• $2');
  }

  /**
   * Generate unique transaction reference
   */
  static generateTxRef(): string {
    return 'NM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  /**
   * Get all banks
   */
  static getBanks(): EthiopianBank[] {
    return ETHIOPIAN_BANKS;
  }

  /**
   * Find bank by ID
   */
  static getBankById(id: string): EthiopianBank | undefined {
    return ETHIOPIAN_BANKS.find((b) => b.id === id);
  }
}
