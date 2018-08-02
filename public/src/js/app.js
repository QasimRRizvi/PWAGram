var deferredPrompt;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then(function() {
			console.log('Service worker registered');
		});
}

self.addEventListener('beforeinstallprompt', function(event) {
	console.log('beforeinstallprompt', event);
	event.preventDefault();
	deferredPrompt = event;
})