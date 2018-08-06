var deferredPrompt;

if(!window.promise) {
	window.promise = promise;
}

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then(function() {
			console.log('Service worker registered');
		}).catch(function(err) {
			console.log(err);
		});
}

self.addEventListener('beforeinstallprompt', function(event) {
	console.log('beforeinstallprompt', event);
	event.preventDefault();
	deferredPrompt = event;
});

var promise = new Promise(function(resolve, reject) {
	setTimeout(function() {
		// resolve('this execute once timer done');
		reject({ code: 500, message: 'An error occured'});
	}, 3000);
});

var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://httpbin.org/ip')
xhr.resposeType = 'json';

xhr.onload = function() {
	console.log(xhr.response);
};

xhr.onerror = function() {
	console.log('error')
}

xhr.send();

fetch('http://httpbin.org/ip')
	.then(function(response) {
		console.log({ response });
		return response.json();
	}).then(function(data) {
		console.log({ data })
	}).catch(function(err) {
		console.log({ err })
	});

fetch('http://httpbin.org/post', {
	method: 'POST',
	header: {
		'Content-Type': 'application/json',
		'Accept': 'application' // not neccessary only depends upon api.
	},
	mode: 'cors',
	body: JSON.stringify({ message: 'This does work!'}) // body is data in ajax
})
	.then(function(response) {
		console.log({ response });
		return response.json();
	}).then(function(data) {
		console.log({ data })
	}).catch(function(err) {
		console.log({ err })
	});

promise.then(function(result) {
	return result;
}).then(function(text) {
	console.log(text);
}).catch(function(err) {
	console.log(err.code, err.message)
});

console.log('right after the setTimeout');