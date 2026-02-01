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
		initDownloadButton();
	});

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
		});
	}

	/**
	 * Initialize download button functionality
	 */
	function initDownloadButton() {
		const downloadBtn = document.getElementById('downloadBtn');
		const videoURLInput = document.getElementById('videoURL');

		if (!downloadBtn || !videoURLInput) return;

		downloadBtn.addEventListener('click', async function () {
			const videoURLs = videoURLInput.value.split(/\s+/).filter(Boolean);

			if (videoURLs.length === 0) {
				alert('Please enter video URLs');
				return;
			}

			try {
				const downloadLinks = await Promise.all(
					videoURLs.map(async function (videoURL) {
						const apiUrl = 'https://api.vidiodownload.com/api/download?videourl=' + encodeURIComponent(videoURL);
						const response = await fetch(apiUrl);
						const data = await response.json();

						if (videoURL.includes('instagram.com')) {
							const contentUrl = data.video[0].contentUrl;
							const thumbnailUrl = data.video[0].thumbnailUrl;
							const name = data.video[0].name;

							return '<div>' +
								'<a href="' + contentUrl + '" download="' + name + '.mp4">Download Video</a><br>' +
								'<img src="' + thumbnailUrl + '" alt="Thumbnail" width="320" height="180">' +
								'</div>';
						} else {
							return data.formats.map(function (format) {
								return '<a href="' + format.url + '" download="' + data.title + '.' + format.ext + '">' +
									format.format + ' - ' + format.ext + '</a><br>';
							}).join('');
						}
					})
				);

				const downloadLinksContainer = document.getElementById('downloadLinks');
				if (downloadLinksContainer) {
					downloadLinksContainer.innerHTML = downloadLinks.join('');
				}
			} catch (error) {
				console.error('Error fetching video information:', error);
				alert('Error fetching video information');
			}
		});
	}

})();