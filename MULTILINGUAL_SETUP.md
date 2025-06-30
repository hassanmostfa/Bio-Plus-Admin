# Multilingual Setup Guide

This dashboard now supports multiple languages with Arabic (RTL) and English (LTR) support. The system is designed to keep forms in LTR direction while allowing the rest of the interface to switch between RTL and LTR based on the selected language.

## Features

- ✅ English and Arabic language support
- ✅ RTL/LTR layout switching
- ✅ Forms remain in LTR direction (as requested)
- ✅ Language switcher in the navbar
- ✅ Persistent language selection (saved in localStorage)
- ✅ Translation keys organized by sections

## How to Use

### 1. Language Switcher

The language switcher is located in the top navbar. Click it to toggle between English and Arabic.

### 2. Using Translations in Components

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### 3. Form Wrapper for LTR Forms

To keep forms in LTR direction regardless of the selected language:

```jsx
import FormWrapper from 'components/FormWrapper';

const MyForm = () => {
  return (
    <FormWrapper>
      <input type="text" placeholder="Enter name..." />
      <select>
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
    </FormWrapper>
  );
};
```

### 4. Adding New Translations

#### English (src/locales/en/translation.json):
```json
{
  "common": {
    "newKey": "New Value"
  },
  "forms": {
    "newFormKey": "New Form Value"
  }
}
```

#### Arabic (src/locales/ar/translation.json):
```json
{
  "common": {
    "newKey": "قيمة جديدة"
  },
  "forms": {
    "newFormKey": "قيمة النموذج الجديدة"
  }
}
```

## File Structure

```
src/
├── i18n.js                    # i18n configuration
├── contexts/
│   └── LanguageContext.js     # Language context provider
├── components/
│   ├── LanguageSwitcher.js    # Language switcher component
│   └── FormWrapper.js         # Form wrapper for LTR forms
├── locales/
│   ├── en/
│   │   └── translation.json   # English translations
│   └── ar/
│       └── translation.json   # Arabic translations
└── assets/css/
    └── rtl.css               # RTL-specific styles
```

## Translation Keys Organization

- `common.*` - Common UI elements (buttons, labels, etc.)
- `auth.*` - Authentication related text
- `forms.*` - Form validation messages
- `navigation.*` - Navigation menu items

## CSS Classes

- `.form-ltr` - Forces LTR direction for forms
- `.ltr-only` - Forces LTR direction for specific elements
- `.language-switcher` - Language switcher specific styles

## Browser Support

The system automatically sets the document direction and language attributes:
- `document.documentElement.dir` - Set to 'rtl' or 'ltr'
- `document.documentElement.lang` - Set to 'ar' or 'en'

## Adding New Languages

1. Create a new translation file in `src/locales/[lang]/translation.json`
2. Add the language to the resources object in `src/i18n.js`
3. Update the language switcher if needed

## Notes

- Forms and form inputs always maintain LTR direction
- The language switcher button itself is always LTR
- Language preference is saved in localStorage
- The system automatically handles RTL layout adjustments 