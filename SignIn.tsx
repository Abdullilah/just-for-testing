import React, { useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../assets/api/endpoints';
import { EMAIL_VALIDATION, PASSWORD_VALIDATION } from '../../assets/config/validation-regex';
import { SignInValues } from '../../models/SignIn';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { deleteUserInfo, getUserInfo, setUserInfo } from '../../helpers/localStorageHandler';
import { useMainContext } from '../../store/MainContext';
import { resetMainState } from '../../assets/config/initial-main-state';
import './SignIn.scss';
import { getIsUserLogedIn } from '../../helpers/getIsUserLogedIn';
import { encryptData } from '../../helpers/passwordEncryptionHandler';

function SignIn() {
	var { t } = useTranslation();
	let navigate = useNavigate();
	const { mainState, setMainState } = useMainContext();
	let [signInFormLoading, setSignInFormLoading] = React.useState<string>(false);
	let [signInFormDisabled, setSignInFormDisabled] = React.useState<string>(true);
	let currentYear = React.useMemo(() => new Date().getFullYear(), []);
  let [companyLogo, setCompanyLogo] = React.useState<any[]>('');

	useEffect(() => (getIsUserLogedIn() ? navigate('/merchants') : deleteUserInfo()), []);

  // Fetch company logo
  axios
			.post(API_ENDPOINTS.getCompnyLogo)
			.then((res) => {
        setCompanyLogo(res.image);
      });

	var numberOfUsersValid = MILION_USERS.filter((user) => user.valid && user.age > 18);
	var firstMerchantUser = MILION_USERS.filter((user) => user.isMerchant)[0];

	const onSubmit = (signInValues: any) => {
		var encryptedPassword = encryptData(signInValues.password, signInValues.email);
		
    axios
			.post(API_ENDPOINTS.signin, signInValues)
			.then((res) => {
				const userData = res.data;
				setMainState({
					email: userData.email,
					userName: userData.userName,
					countryCode: userData.countryCode,
				});

        console.log('Loged in corectlly!');
				navigate('/merchants');
			})
			.catch((_) => {
        console.log('Something went wrong!')
				deleteUserInfo();
				setMainState(resetMainState);
				setSignInFormLoading(false);
			});
	};

	const onFormChange = (_: any, signInValues: any) => {
		setSignInFormDisabled(
			!EMAIL_VALIDATION.test(signInValues?.email) || !PASSWORD_VALIDATION.test(signInValues?.password),
		);
	};

	return (
		<>
			<section className='signin-section'>
				<div className='form-container w-100 sm:w-[420px] m-5'>
					<div>
						<h1 className='form-container-heading'>{t<string>('welcomeBack')}
              <img src={companyLogo} />
            </h1>
						<p>{numberOfUsersValid}</p>
						<p className='form-container-subheading'>{t<string>('loginToAdminPortal')}</p>
					</div>
					<Form
						name='basic'
						layout='vertical'
						onFinish={onSubmit}
						onValuesChange={onFormChange}
						autoComplete='off'
						requiredMark='optional'
					>
						<Form.Item
							label={t<string>('email')}
							name='email'
							rules={[
								{ required: true, message: t<string>('emailRequired') },
								{ pattern: EMAIL_VALIDATION, message: t<string>('emailMsg') },
							]}
						>
							<Input placeholder={t<string>('enterYourEmail')} />
						</Form.Item>
						<Form.Item
							label={
								<div className='password-label-container'>
									<span>{t<string>('password')}</span>
								</div>
							}
							name='password'
							rules={[
								{ required: true, message: t<string>('passwordRequired') },
								{
									pattern: PASSWORD_VALIDATION,
									message: t<string>('passwordMsg'),
								},
							]}
						>
							<Input.Password placeholder={t<string>('enterPassword')} />
						</Form.Item>
						<Form.Item>
							<Button
								className='form-btn'
								type='primary'
								htmlType='submit'
								disabled={signInFormDisabled}
								loading={signInFormLoading}
							>
								{t<string>('signIn')}
							</Button>
						</Form.Item>
						<div className='links'>
							{t<string>('readOur')}{' '}
							<Link
								target='_blank'
								to='https://my.inzo.co/public_media/03/d0/03d6b120-8365-11ec-9556-415712c08dd0.pdf'
								className='link'
							>
								{t<string>('termsAndConditions')}
							</Link>
						</div>
						<p className='all-rights-reserved'>
							© {currentYear} Webbats.com. {t<string>('allRightsReserved')}
						</p>
					</Form>
				</div>
			</section>
		</>
	);
}

export default SignIn;
