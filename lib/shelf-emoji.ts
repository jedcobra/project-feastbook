// The choices for a shelf's icon: the emoji keyboard's Food & Drink section
// and country flags.

// Food & Drink (Unicode's food-drink group), in keyboard order.
// prettier-ignore
export const FOOD_EMOJI: string[] = [
  // Fruit
  '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥',
  // Vegetables
  '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🥜', '🫘', '🌰', '🫚', '🫛',
  // Prepared food
  '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪',
  '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫',
  // Asian food
  '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡',
  // Seafood
  '🦀', '🦞', '🦐', '🦑', '🦪',
  // Sweets
  '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯',
  // Drinks
  '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🥤', '🧋', '🧃', '🧉', '🧊',
  // Dishware
  '🥢', '🍽️', '🍴', '🥄', '🔪', '🫙', '🏺',
];

// Regions with a flag emoji, minus the ones that aren't a country or a
// territory with its own food (Antarctica, the EU, the UN, uninhabited
// islands and the like).
const FLAG_REGIONS =
  'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK ' +
  'FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR ' +
  'IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH ' +
  'MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK ' +
  'PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ ' +
  'TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW';

// A two-letter region code's flag is its letters as regional indicator
// symbols (🇦 is U+1F1E6).
const regionFlag = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

// England, Scotland and Wales have their own flags (tag sequences rather
// than region pairs) — and their own cooking.
const UK_NATION_FLAGS = [
  {
    emoji: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
    name: 'England',
  },
  {
    emoji: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
    name: 'Scotland',
  },
  {
    emoji: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}',
    name: 'Wales',
  },
];

function regionName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

// Every flag with its country's name (for screen readers), sorted by name
// like the emoji keyboard.
export const FLAG_EMOJI: { emoji: string; name: string }[] = [
  ...FLAG_REGIONS.split(' ').map((code) => ({
    emoji: regionFlag(code),
    name: regionName(code),
  })),
  ...UK_NATION_FLAGS,
].sort((a, b) => a.name.localeCompare(b.name));

// Emoji are drawn by the system's colour emoji font, not the app's mono or
// display faces.
export const EMOJI_FONT_CLASS =
  "[font-family:'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji',sans-serif] leading-none";
