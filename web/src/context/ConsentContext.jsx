import React, { createContext, useState, useEffect } from 'react';
import { CookieManager, useCookieConsent } from 'react-cookie-manager';
import 'react-cookie-manager/style.css';
import Cookies from 'js-cookie';

// Create the Consent Context
export const ConsentContext = createContext();

export function ConsentProvider({ children }) {
	const [consent, setConsent] = useState(null); // ✅ Define consent state
	const [showConsentBanner, setShowConsentBanner] = useState(() => () => {}); // Default no-op function
	const [previousConsent, setPreviousConsent] = useState(null); // ✅ Store previous consent

	/*

	// Function to update consent and store it in cookies
	const updateConsent = (preferences) => {
		setConsent(preferences); // ✅ Update state immediately
		Cookies.set('cookieConsent', JSON.stringify(preferences), {
			expires: 365,
			path: '/',
			secure: true,
			sameSite: 'Strict',
		});
	};
  */

	const updateConsent = (preferences) => {
		setConsent((prevConsent) => {
			// Preserve existing values and only update what's provided
			const newConsent = {
				Analytics: {
					consented:
						preferences.Analytics !== undefined
							? preferences.Analytics
							: prevConsent?.Analytics?.consented ?? false,
					timestamp: new Date().toISOString(),
				},
				Social: {
					consented:
						preferences.Social !== undefined
							? preferences.Social
							: prevConsent?.Social?.consented ?? false,
					timestamp: new Date().toISOString(),
				},
				Advertising: {
					consented:
						preferences.Advertising !== undefined
							? preferences.Advertising
							: prevConsent?.Advertising?.consented ?? false,
					timestamp: new Date().toISOString(),
				},
			};

			// ✅ Save the updated consent to cookies
			Cookies.set('cookieConsent', JSON.stringify(newConsent), {
				expires: 365,
				path: '/',
				secure: true,
				sameSite: 'Strict',
			});

			console.log('Updated Consent:', newConsent);

			return newConsent;
		});
	};

	// Effect: Read cookie on mount and update state dynamically
	useEffect(() => {
		const fetchConsent = () => {
			const consentCookie = Cookies.get('cookieConsent');
			if (consentCookie) {
				try {
					const parsedConsent = JSON.parse(consentCookie);

					// ✅ Only update if the consent has actually changed
					if (
						JSON.stringify(parsedConsent) !== JSON.stringify(previousConsent)
					) {
						console.log('User Cookie Consent:', parsedConsent);
						setConsent(parsedConsent);
						setPreviousConsent(parsedConsent); // ✅ Store previous consent
					}
				} catch (error) {
					console.error('Error parsing cookieConsent:', error);
				}
			}
		};

		fetchConsent();

		// ✅ Check for cookie updates every second but only update if needed
		const interval = setInterval(fetchConsent, 1000);
		return () => clearInterval(interval); // Cleanup on unmount
	}, [previousConsent]); // ✅ Only run if `previousConsent` changes

	return (
		<ConsentContext.Provider
			value={{ consent, updateConsent, showConsentBanner }}>
			<CookieManager
				translations={{
					title: 'Cookie Preferences',
					message: 'We use cookies to improve your experience.',
					buttonText: 'Accept All',
					declineButtonText: 'Decline All',
					manageButtonText: 'Manage Cookies',
					privacyPolicyText: 'Privacy Policy',
				}}
				showManageButton={true} // We control it manually
				displayType="modal"
				theme="dark"
				privacyPolicyUrl="https://example.com/privacy"
				cookieKey="cookieConsent"
				cookieExpiration={365}
				onManage={(preferences) => {
					console.log('Cookie preferences updated:', preferences);
					updateConsent(preferences);
				}}>
				<ConsentContextUpdater setShowConsentBanner={setShowConsentBanner} />
				{children}
			</CookieManager>
		</ConsentContext.Provider>
	);
}

// Ensure `useCookieConsent` is called after `CookieManager` is mounted
function ConsentContextUpdater({ setShowConsentBanner }) {
	const { showConsentBanner } = useCookieConsent();

	useEffect(() => {
		setShowConsentBanner(() => showConsentBanner); // ✅ Store function safely
	}, [showConsentBanner, setShowConsentBanner]);

	return null;
}
