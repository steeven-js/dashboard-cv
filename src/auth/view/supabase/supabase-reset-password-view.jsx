import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { PasswordIcon } from 'src/assets/icons';

import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../../components/form-head';
import { resetPassword } from '../../context/supabase';
import { FormReturnLink } from '../../components/form-return-link';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
});

// ----------------------------------------------------------------------

export function SupabaseResetPasswordView() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isRequestSent, setIsRequestSent] = useState(false);

  // Countdown timer for cooldown
  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (cooldownTime > 0) {
        setErrorMessage(`Please wait ${cooldownTime} seconds before trying again.`);
        return;
      }

      await resetPassword({ email: data.email });
      setIsRequestSent(true);
      setErrorMessage('');
      router.push(paths.auth.supabase.verify);
    } catch (error) {
      console.error(error);

      // Handle rate limiting errors
      if (error.message && error.message.includes('security purposes') && error.message.includes('seconds')) {
        const waitTimeMatch = error.message.match(/(\d+) seconds/);
        const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1], 10) : 30;
        setCooldownTime(waitTime);
        setErrorMessage(`For security purposes, please wait ${waitTime} seconds before trying again.`);
      } else {
        setErrorMessage(error.message || 'Failed to send password reset link. Please try again later.');
      }
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        autoFocus
        name="email"
        label="Email address"
        placeholder="example@gmail.com"
        slotProps={{ inputLabel: { shrink: true } }}
        disabled={cooldownTime > 0 || isRequestSent}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 0 }}>
          {errorMessage}
        </Alert>
      )}

      {cooldownTime > 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          You can request again in {cooldownTime} seconds
        </Typography>
      )}

      {isRequestSent && (
        <Alert severity="success" sx={{ mb: 0 }}>
          Password reset link sent! Please check your email.
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Send request..."
        disabled={cooldownTime > 0 || isRequestSent}
      >
        Send request
      </Button>
    </Box>
  );

  return (
    <>
      <FormHead
        icon={<PasswordIcon />}
        title="Forgot your password?"
        description={`Please enter the email address associated with your account and we'll email you a link to reset your password.`}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <FormReturnLink href={paths.auth.supabase.signIn} />
    </>
  );
}
