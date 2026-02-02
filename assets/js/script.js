/* ===================================
	VidioDownload Main JavaScript
	Vanilla JS (jQuery removed)
====================================== */

(function () {
	"use strict";

	// Wait for DOM to be ready
	document.addEventListener('DOMContentLoaded', function () {
		initDropdowns();
		initInputClear();
		initMockDownloadButton();
		initMobileMenu();
	});

	/**
	 * Platform detection patterns
	 */
	const PLATFORM_PATTERNS = {
		youtube: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
		instagram: /instagram\.com\/(p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/,
		facebook: /(?:facebook\.com|fb\.watch)\/(?:watch\/?\?v=|.*\/videos\/|reel\/)?([\d]+|[a-zA-Z0-9._]+)/,
		twitter: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
		tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)|vm\.tiktok\.com\/(\w+)/,
		vimeo: /vimeo\.com\/(\d+)/
	};

	/**
	 * Mock video data for demo
	 */
	const MOCK_VIDEO_DATA = {
		youtube: {
			title: "Video from YouTube",
			formats: [
				{ quality: "1080p HD", format: "MP4", size: "45.2 MB" },
				{ quality: "720p HD", format: "MP4", size: "28.7 MB" },
				{ quality: "128 kbps", format: "MP3", size: "4.2 MB", isAudio: true }
			]
		},
		instagram: {
			title: "Instagram Video",
			formats: [
				{ quality: "1080p HD", format: "MP4", size: "12.8 MB" },
				{ quality: "720p HD", format: "MP4", size: "8.4 MB" }
			]
		},
		facebook: {
			title: "Facebook Video",
			formats: [
				{ quality: "HD Quality", format: "MP4", size: "35.6 MB" },
				{ quality: "SD Quality", format: "MP4", size: "18.2 MB" }
			]
		},
		twitter: {
			title: "Twitter/X Video",
			formats: [
				{ quality: "1080p HD", format: "MP4", size: "22.4 MB" },
				{ quality: "720p HD", format: "MP4", size: "14.1 MB" }
			]
		},
		tiktok: {
			title: "TikTok Video",
			formats: [
				{ quality: "HD (No Watermark)", format: "MP4", size: "8.9 MB" },
				{ quality: "HD (With Watermark)", format: "MP4", size: "8.7 MB" }
			]
		},
		vimeo: {
			title: "Vimeo Video",
			formats: [
				{ quality: "1080p HD", format: "MP4", size: "52.1 MB" },
				{ quality: "720p HD", format: "MP4", size: "31.8 MB" }
			]
		},
		default: {
			title: "Online Video",
			formats: [
				{ quality: "Best Quality", format: "MP4", size: "25.0 MB" },
				{ quality: "Standard Quality", format: "MP4", size: "12.0 MB" }
			]
		}
	};

	/**
	 * Detect platform from URL
	 */
	function detectPlatform(url) {
		for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
			if (pattern.test(url)) {
				return platform;
			}
		}
		return 'default';
	}

	/**
	 * Get platform icon SVG (large version)
	 */
	function getPlatformIcon(platform) {
		const icons = {
			youtube: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
			instagram: `<svg viewBox="0 0 24 24" width="80" height="80"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#FFDC80"/><stop offset="25%" style="stop-color:#FCAF45"/><stop offset="50%" style="stop-color:#F77737"/><stop offset="75%" style="stop-color:#F56040"/><stop offset="100%" style="stop-color:#C13584"/></linearGradient></defs><path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
			facebook: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
			twitter: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
			tiktok: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#000" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
			vimeo: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#1AB7EA" d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>`,
			default: `<svg viewBox="0 0 24 24" width="80" height="80"><path fill="#6366f1" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 7.5v9l7-4.5z"/></svg>`
		};
		return icons[platform] || icons.default;
	}

	/**
	 * Capitalize first letter
	 */
	function capitalizeFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Generate simple preview HTML with platform icon
	 */
	function generatePreviewHTML(platform) {
		return `
			<div class="vd__preview-container">
				<div class="vd__preview-box">
					<div class="vd__platform-icon-large">
						${getPlatformIcon(platform)}
					</div>
					<h3 class="vd__video-title">${capitalizeFirst(platform)} Video</h3>
					<p class="vd__video-info">Video ready for download</p>
				</div>
			</div>
		`;
	}

	/**
	 * Generate download options HTML
	 */
	function generateDownloadOptionsHTML(platform) {
		const data = MOCK_VIDEO_DATA[platform] || MOCK_VIDEO_DATA.default;
		let html = '<ul>';

		data.formats.forEach(format => {
			const iconClass = format.isAudio ? 'audio' : 'video';
			const iconSrc = format.isAudio ? 'assets/images/icon-audio.svg' : 'assets/images/icon-video.svg';

			html += `
				<li>
					<div class="vd__format ${iconClass}">
						<img src="${iconSrc}" alt="File Icon" width="48" height="48">
						<div class="vd__format__info">${format.quality} • ${format.format} • ${format.size}</div>
						<div class="btn vd__download" onclick="simulateDownload(this)">Download</div>
					</div>
				</li>
			`;
		});

		html += '</ul>';
		return html;
	}

	/**
	 * Show loading state on button
	 */
	function showLoadingState(button) {
		button.classList.add('loading');
		button.disabled = true;
		button.innerHTML = `
			<span class="spinner"></span>
			<span class="loading-text">Processing...</span>
		`;
	}

	/**
	 * Hide loading state on button
	 */
	function hideLoadingState(button, originalText) {
		button.classList.remove('loading');
		button.disabled = false;
		button.innerHTML = originalText;
	}

	/**
	 * Get random loading duration between 30-45 seconds
	 */
	function getRandomLoadingTime() {
		return Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;
	}

	/**
	 * Initialize mock download button functionality
	 */
	function initMockDownloadButton() {
		const downloadBtn = document.getElementById('downloadBtn');
		const videoURLInput = document.getElementById('videoURL');

		if (!downloadBtn || !videoURLInput) return;

		const originalButtonText = downloadBtn.innerHTML;

		downloadBtn.addEventListener('click', async function () {
			const videoURL = videoURLInput.value.trim();

			if (!videoURL) {
				showError('Please enter a video URL');
				return;
			}

			// Basic URL validation
			if (!isValidURL(videoURL)) {
				showError('Please enter a valid URL');
				return;
			}

			const platform = detectPlatform(videoURL);

			// Show loading state on button
			showLoadingState(downloadBtn);

			// Get the vd__section container
			const vdSection = document.querySelector('.vd__section');
			if (vdSection) {
				vdSection.innerHTML = `
					<div class="container">
						<div class="vd__loading-container">
							<div class="vd__loading-spinner"></div>
							<p class="vd__loading-text">Fetching video information...</p>
							<div class="vd__progress-bar">
								<div class="vd__progress-fill"></div>
							</div>
						</div>
					</div>
				`;
				vdSection.classList.add('active');
			}

			// Random loading time between 30-45 seconds
			const loadingDuration = getRandomLoadingTime();

			await new Promise(resolve => setTimeout(resolve, loadingDuration));

			// Hide loading state
			hideLoadingState(downloadBtn, originalButtonText);

			// Generate and display preview with download options
			if (vdSection) {
				const previewHTML = generatePreviewHTML(platform);
				const downloadOptionsHTML = generateDownloadOptionsHTML(platform);

				vdSection.innerHTML = `
					<div class="container">
						<div class="vd__info">
							${previewHTML}
						</div>
						<div class="vd__format_list">
							${downloadOptionsHTML}
						</div>
					</div>
				`;
			}
		});
	}

	/**
	 * Validate URL
	 */
	function isValidURL(string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}

	/**
	 * Show error message
	 */
	function showError(message) {
		const videoURLInput = document.getElementById('videoURL');
		if (videoURLInput) {
			videoURLInput.classList.add('error');

			// Remove existing error message
			const existingError = document.querySelector('.vd__error-message');
			if (existingError) existingError.remove();

			// Add error message
			const errorDiv = document.createElement('div');
			errorDiv.className = 'vd__error-message';
			errorDiv.textContent = message;
			videoURLInput.parentElement.appendChild(errorDiv);

			// Remove error after 3 seconds
			setTimeout(() => {
				videoURLInput.classList.remove('error');
				errorDiv.remove();
			}, 3000);
		}
	}

	/**
	 * Initialize mobile menu functionality
	 */
	function initMobileMenu() {
		const trigger = document.querySelector('.mobile-menu-trigger');
		const nav = document.querySelector('nav');

		if (!trigger || !nav) return;

		trigger.addEventListener('click', function (e) {
			e.preventDefault();
			trigger.classList.toggle('active');

			let mobileNav = document.querySelector('.mobile-nav');
			if (!mobileNav) {
				mobileNav = document.createElement('div');
				mobileNav.className = 'mobile-nav';
				mobileNav.innerHTML = nav.innerHTML;
				document.querySelector('.menu__wrapper').appendChild(mobileNav);
			}

			mobileNav.classList.toggle('active');
		});

		document.addEventListener('click', function (e) {
			if (!e.target.closest('.menu__wrapper')) {
				const mobileNav = document.querySelector('.mobile-nav');
				if (mobileNav && mobileNav.classList.contains('active')) {
					mobileNav.classList.remove('active');
				}
			}
		});
	}

	/**
	 * Initialize dropdown hover functionality
	 */
	function initDropdowns() {
		const dropdowns = document.querySelectorAll('.dropdown');

		dropdowns.forEach(function (dropdown) {
			const content = dropdown.querySelector('.dropdown-content');
			if (!content) return;

			dropdown.addEventListener('mouseenter', function () {
				content.style.display = 'block';
				slideDown(content, 200);
			});

			dropdown.addEventListener('mouseleave', function () {
				slideUp(content, 200).then(function () {
					content.style.display = 'none';
				});
			});
		});
	}

	/**
	 * Slide down animation
	 */
	function slideDown(element, duration) {
		element.style.display = 'block';
		element.style.overflow = 'hidden';
		element.style.height = '0';
		element.style.transition = 'height ' + duration + 'ms ease';

		const height = element.scrollHeight;
		requestAnimationFrame(function () {
			element.style.height = height + 'px';
		});

		return new Promise(function (resolve) {
			setTimeout(function () {
				element.style.height = '';
				element.style.overflow = '';
				element.style.transition = '';
				resolve();
			}, duration);
		});
	}

	/**
	 * Slide up animation
	 */
	function slideUp(element, duration) {
		element.style.overflow = 'hidden';
		element.style.height = element.scrollHeight + 'px';
		element.style.transition = 'height ' + duration + 'ms ease';

		requestAnimationFrame(function () {
			element.style.height = '0';
		});

		return new Promise(function (resolve) {
			setTimeout(resolve, duration);
		});
	}

	/**
	 * Initialize input clear button functionality
	 */
	function initInputClear() {
		const inputField = document.querySelector('.hero__inpit input');
		const clearBtn = document.querySelector('.inpit__clear img');

		if (!inputField || !clearBtn) return;

		inputField.addEventListener('input', function () {
			if (this.value.trim()) {
				clearBtn.classList.add('block');
			} else {
				clearBtn.classList.remove('block');
			}
		});

		clearBtn.addEventListener('click', function () {
			clearBtn.classList.remove('block');
			inputField.value = '';
			inputField.focus();

			// Reset the vd__section
			const vdSection = document.querySelector('.vd__section');
			if (vdSection) {
				vdSection.classList.remove('active');
				vdSection.innerHTML = '';
			}
		});
	}

})();

/**
 * Global function to simulate download with network error
 */
function simulateDownload(button) {
	const originalText = button.textContent;
	button.textContent = 'Preparing...';
	button.classList.add('downloading');

	// Get the vd__section for showing loading
	const vdSection = document.querySelector('.vd__section');
	const currentContent = vdSection ? vdSection.innerHTML : '';

	// Show download loading state
	if (vdSection) {
		vdSection.innerHTML = `
			<div class="container">
				<div class="vd__loading-container">
					<div class="vd__loading-spinner"></div>
					<p class="vd__loading-text">Preparing download...</p>
					<div class="vd__progress-bar">
						<div class="vd__progress-fill vd__progress-download"></div>
					</div>
				</div>
			</div>
		`;
	}

	// Random time between 30-45 seconds
	const downloadTime = Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;

	setTimeout(() => {
		// Show download ready message
		if (vdSection) {
			vdSection.innerHTML = `
				<div class="container">
					<div class="vd__download-ready">
						<div class="vd__download-icon">
							<svg viewBox="0 0 24 24" width="64" height="64" fill="#22c55e">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
							</svg>
						</div>
						<h3 class="vd__download-title">Download Starting Automatically</h3>
						<p class="vd__download-text">If download doesn't start, <a href="#" class="vd__click-here" onclick="restartDownload(event)">click here</a></p>
					</div>
				</div>
			`;
		}

		button.textContent = originalText;
		button.classList.remove('downloading');
	}, downloadTime);
}

/**
 * Global function to restart download loading (loops forever)
 */
function restartDownload(event) {
	event.preventDefault();

	const vdSection = document.querySelector('.vd__section');
	if (!vdSection) return;

	// Show loading state
	vdSection.innerHTML = `
		<div class="container">
			<div class="vd__loading-container">
				<div class="vd__loading-spinner"></div>
				<p class="vd__loading-text">Preparing download...</p>
				<div class="vd__progress-bar">
					<div class="vd__progress-fill vd__progress-download"></div>
				</div>
			</div>
		</div>
	`;

	// Random time between 30-45 seconds
	const downloadTime = Math.floor(Math.random() * (45000 - 30000 + 1)) + 30000;

	setTimeout(() => {
		// Show download ready message again (loops)
		if (vdSection) {
			vdSection.innerHTML = `
				<div class="container">
					<div class="vd__download-ready">
						<div class="vd__download-icon">
							<svg viewBox="0 0 24 24" width="64" height="64" fill="#22c55e">
								<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
							</svg>
						</div>
						<h3 class="vd__download-title">Download Starting Automatically</h3>
						<p class="vd__download-text">If download doesn't start, <a href="#" class="vd__click-here" onclick="restartDownload(event)">click here</a></p>
					</div>
				</div>
			`;
		}
	}, downloadTime);
}