import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Text, Button } from '@chakra-ui/react';
import { IoMdArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const EditBranch = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <form dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <Text color={textColor} fontSize="22px" fontWeight="700">
        {t('branches.editBranch')}
      </Text>
      <Button type="button" onClick={() => navigate(-1)} colorScheme="teal" size="sm" leftIcon={<IoMdArrowBack />}>
        {t('branches.back')}
      </Button>
      {/* ...replace all labels, placeholders, and button text below with t('branches.KEY') or similar... */}
    </form>
  );
};

export default EditBranch; 