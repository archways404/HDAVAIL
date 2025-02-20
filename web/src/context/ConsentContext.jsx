import React, { createContext, useEffect, useState } from 'react';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import LoadingScreen from '@/components/LoadingScreen';

// Create the Consent Context
export const ConsentContext = createContext();

export function ConsentProvider({ children }) {
	const [consent, setConsent] = useState(null);
	const [loading, setLoading] = useState(true);

	const updateConsent = () => {
		const cookie = CookieConsent.getCookie();
		if (!cookie || !cookie.categories) return;

		const userConsent = {
			consentId: cookie.consentId || null,
			acceptType: 'custom',
			acceptedCategories: cookie.categories || [],
		};

		// ✅ Ensure preferences modal pre-selects accepted categories
		if (userConsent.acceptedCategories.length > 0) {
			CookieConsent.acceptCategory(userConsent.acceptedCategories);
		}

		setConsent(userConsent); // Store consent state in React Context
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.CookieConsent = CookieConsent;
		}

		const storedConsent = CookieConsent.getCookie();
		let hasConsent = false;

		if (storedConsent && storedConsent.categories) {
			setConsent({
				consentId: storedConsent.consentId || null,
				acceptType: 'custom',
				acceptedCategories: storedConsent.categories || [],
			});

			// ✅ Restore accepted categories after refresh
			CookieConsent.acceptCategory(storedConsent.categories);
			hasConsent = true;
		}

		// ✅ Apply Custom Dark Theme with Red Accents
		const root = document.documentElement;

		// General background and text colors
		root.style.setProperty('--cc-bg', '#161a1c'); // Dark Background
		root.style.setProperty('--cc-primary-color', '#ebf3f6'); // Primary text color
		root.style.setProperty('--cc-secondary-color', '#aebbc5'); // Secondary text color

		// 🔴 Buttons - Dark with Red Accents
		root.style.setProperty('--cc-btn-primary-bg', '#242c31'); // 🔴 Red primary button
		root.style.setProperty('--cc-btn-primary-color', '#ffffff'); // White text on red
		root.style.setProperty('--cc-btn-primary-border-color', '#ff4444'); // Red border
		root.style.setProperty('--cc-btn-primary-hover-bg', '#cc0000'); // Darker red on hover
		root.style.setProperty('--cc-btn-primary-hover-color', '#ffffff'); // White text on hover
		root.style.setProperty('--cc-btn-primary-hover-border-color', '#cc0000'); // Darker red border on hover

		root.style.setProperty('--cc-btn-secondary-bg', '#242c31'); // Dark gray secondary buttons
		root.style.setProperty('--cc-btn-secondary-color', '#ffffff'); // White text for secondary buttons
		root.style.setProperty('--cc-btn-secondary-border-color', '#ff4444'); // Red border for contrast
		root.style.setProperty('--cc-btn-secondary-hover-bg', '#cc0000'); // Slightly lighter dark gray on hover
		root.style.setProperty('--cc-btn-secondary-hover-color', '#ffffff'); // 🔴 Red text on hover
		root.style.setProperty('--cc-btn-secondary-hover-border-color', '#cc0000'); // Brighter red on hover

		// ✅ Toggles - Primarily Dark with Red Highlights
		root.style.setProperty('--cc-toggle-on-bg', '#ff4444'); // 🔴 Red when enabled
		root.style.setProperty('--cc-toggle-off-bg', '#252a2e'); // Dark gray when disabled
		root.style.setProperty('--cc-toggle-on-knob-bg', '#ffffff'); // White knob when on
		root.style.setProperty('--cc-toggle-off-knob-bg', '#ffffff'); // White knob when off

		// ✅ Toggle Icons (✓ and ✗ inside the toggles)
		root.style.setProperty('--cc-toggle-enabled-icon-color', '#ffffff'); // White tick for enabled
		root.style.setProperty('--cc-toggle-disabled-icon-color', '#ff4444'); // Red cross for disabled

		// ✅ Read-Only Toggles (Categories that can't be changed)
		root.style.setProperty('--cc-toggle-readonly-bg', '#343e45'); // Dark gray background
		root.style.setProperty('--cc-toggle-readonly-knob-bg', '#5f6b72'); // Slightly lighter knob
		root.style.setProperty('--cc-toggle-readonly-knob-icon-color', '#ffffff'); // White icon

		// ✅ Category Section Borders & Backgrounds (Subtle Red Accents)
		root.style.setProperty('--cc-section-category-border', '#252a2e'); // Dark gray section borders
		root.style.setProperty('--cc-cookie-category-block-bg', '#1e2428'); // Category block background
		root.style.setProperty('--cc-cookie-category-block-border', '#252a2e'); // Darker border for contrast
		root.style.setProperty('--cc-cookie-category-block-hover-bg', '#242c31'); // Slightly lighter dark gray on hover
		root.style.setProperty(
			'--cc-cookie-category-block-hover-border',
			'#ff4444'
		); // 🔴 Red hover border

		// ✅ Expanded Blocks - Keep Dark with Minimal Red Highlights
		root.style.setProperty('--cc-cookie-category-expanded-block-bg', '#161a1c'); // Match the background
		root.style.setProperty(
			'--cc-cookie-category-expanded-block-hover-bg',
			'#242c31'
		); // Slightly lighter on hover

		// ✅ Overlay & Footer - Keep Dark with a Touch of Red
		root.style.setProperty('--cc-overlay-bg', 'rgba(0, 0, 0, 0.85)'); // Darker overlay for contrast
		root.style.setProperty('--cc-footer-bg', '#0c0e0f'); // Dark footer
		root.style.setProperty('--cc-footer-color', '#aebbc5'); // Light gray footer text
		root.style.setProperty('--cc-footer-border-color', '#ff4444'); // 🔴 Red footer border

		// ✅ Remove Top Border on `.cm__btns`
		const style = document.createElement('style');
		style.innerHTML = `
    #cc-main .cm__btns {
        border-top: none !important;
    }
		
		#cc-main .pm__footer {
			border-top: none !important;
		}
		
		#cc-main .pm__header {
			border-bottom: none !important;
		}
		
		#cc-main .pm__close-btn:hover {
  		background: var(--cc-btn-secondary-hover-bg) !important;
 	 		border-color: var(--cc-btn-secondary-hover-border-color) !important;
		}

		#cc-main .pm__close-btn {
  		background: none !important;
 	 		border: none !important;
		}

		#cc-main .cm__footer {
			background: none !important;
			border-top: none !important;
		}

		#cc-main a:hover {
			color: var(--cc-btn-secondary-hover-border-color) !important;
		}

		#cc-main a {
			color: var(--cc-secondary-color) !important;
		}
`;
		document.head.appendChild(style);

		// ✅ Ensure Dark Mode
		root.style.setProperty('color-scheme', 'dark');

		// ✅ Initialize CookieConsent
		CookieConsent.run({
			autoShow: false,
			hideFromBots: true,
			disablePageInteraction: true,
			cookie: { name: 'cc_cookie', expiresAfterDays: 365 },
			guiOptions: {
				consentModal: {
					layout: 'box wide',
					position: 'middle center',
					equalWeightButtons: false,
					flipButtons: true,
				},
				preferencesModal: {
					layout: 'box',
					equalWeightButtons: true,
					flipButtons: false,
				},
			},
			onFirstConsent: () => {
				updateConsent();
				setLoading(false);
			},
			onConsent: () => {
				updateConsent();
				setLoading(false);
			},
			onChange: () => {
				updateConsent();
			},
			categories: {
				necessary: {
					enabled: true,
					readOnly: true,
				},
				preferences: {},
				analytics: {
					autoClear: {
						cookies: [{ name: /^_ga/ }, { name: '_gid' }],
					},
				},
			},
			language: {
				default: 'en',
				translations: {
					en: {
						consentModal: {
							title: 'We Value Your Privacy',
							description: `We use cookies to ensure our website functions properly and to provide you with a personalized experience. We also use cookies for analytics and security purposes.<br><br>
							By clicking "<span style="font-weight:600;">Accept All</span>", you agree to the use of all cookies.
							To learn more about how we handle your data, please review our <a href="#path-to-privacy-policy.html" target="_blank">Privacy Policy</a>.`,
							acceptAllBtn: 'Accept All',
							acceptNecessaryBtn: 'Reject All',
							showPreferencesBtn: 'Preferences',
						},
						preferencesModal: {
							title: 'Privacy & Cookies',
							acceptAllBtn: 'Accept All',
							acceptNecessaryBtn: 'Reject All',
							savePreferencesBtn: 'Save Selection',
							closeIconLabel: 'Close',
							sections: [
								{
									title: '',
									description:
										'Manage your preferences for cookies. Some are essential for functionality, while others help us improve your experience. You can adjust these settings anytime.',
								},
								{
									title: 'Strictly Necessary',
									description:
										'These cookies are essential for the website to function and cannot be disabled. They ensure security, session management, and basic functionality.',
									linkedCategory: 'necessary',
								},
								{
									title: 'Preferences',
									description:
										'Allows us to remember your preferences, such as Dark Mode, language settings, or other customizations to enhance your experience.',
									linkedCategory: 'preferences',
								},
								{
									title: 'Performance and Analytics',
									description:
										'These cookies help us analyze website traffic, detect errors, and understand how users interact with our site to improve functionality.',
									linkedCategory: 'analytics',
								},
							],
						},
					},
				},
			},
		});

		// ✅ Show modal if user hasn't given consent
		if (!hasConsent) {
			setTimeout(() => {
				if (window.CookieConsent) {
					window.CookieConsent.show();
					setLoading(false);
				}
			}, 1000);
		} else {
			setLoading(false);
		}
	}, []);

	return (
		<ConsentContext.Provider value={{ consent, updateConsent, loading }}>
			{!loading ? children : <LoadingScreen />}
		</ConsentContext.Provider>
	);
}
