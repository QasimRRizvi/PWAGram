const CACHE_STATIC_NAME = 'static-v13';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_FILES = [
	'/',
	'/index.html',
	'/offline.html',
	'/src/js/app.js',
	'/src/js/feed.js',
	'/src/js/promise.js',
	'/src/js/fetch.js',
	'/src/js/material.min.js',
	'/src/css/app.css',
	'/src/css/feed.css',
	'/src/images/main-image.jpg',
	'https://fonts.googleapis.com/css?family=Roboto:400,700',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

function trimCache(cacheName, maxItems) {
	caches.open(cacheName)
		.then(function(cache) {
			return cache.keys()
				.then(function(keys) {
					if(keys.length > maxItems) {
						cache.delete(keys[0])
							.then(trimCache(cacheName, maxItems));
					}
				})
		});
}

self.addEventListener('install', function(event) {
	console.log('[Service Worker] Installing Service Worker ...', event);
	event.waitUntil(
		caches.open(CACHE_STATIC_NAME)
			.then(function(cache) {
				console.log('[Service Worker] PreCaching App Shell');
				cache.addAll(STATIC_FILES);
			})
	);
});

self.addEventListener('activate', function(event) {
	console.log('[Service Worker] Activating Service Worker ...', event);
	event.waitUntil(
		caches.keys()
			.then(function(keyList) {
				return Promise.all(keyList.map(function(key) {
					if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
						console.log('[Service Worker] Removing old caches', key);
						return caches.delete(key);
					}
				}));
			})
	);
	return self.clients.claim();
});

// helper function to check route
function isInArray(string, array) {
	for (var i = 0; i < array.length ; i++) {
		if (array[i] === string) {
			return true;
		}
		return false
	}
}
// Cache-then-Network strategy in if
// Cache-only strategy in else if
// Cache-with-network-fallback in else
self.addEventListener('fetch', function(event) {
	var url = 'https://httpbin.org/get';
	if(event.request.url.indexOf(url) > -1) {
		event.respondWith(
			caches.open(CACHE_DYNAMIC_NAME)
				.then(function(cache) {
					return fetch(event.request)
						.then(function(res) {
							trimCache(CACHE_DYNAMIC_NAME, 10);
							cache.put(event.request, res.clone());
							return res;
						});
				})
		);
	} else if (isInArray(event.request.url, STATIC_FILES)) {
		event.respondWith(
		 caches.match(event.request)
		);
	} else {
		event.respondWith(
			caches.match(event.request)
				.then(function(response) {
					if (response) {
						return response;
					} else {
						return fetch(event.request)
							.then(function(res) {
								return caches.open(CACHE_DYNAMIC_NAME)
									.then(function(cache) {
										trimCache(CACHE_DYNAMIC_NAME, 10);
										cache.put(event.request.url, res.clone());
										return res;
									})
							})
							.catch(function(err) {
								return caches.open(CACHE_STATIC_NAME)
									.then(function(cache) {
										if(event.request.headers.get('accept').includes('text/html')) {
											return cache.match('/offline.html');
										}
									});
							});
					}
				})
		);	
	}
});

// Cache-with-network-fallback
/*self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
			.then(function(response) {
				if (response) {
					return response;
				} else {
					return fetch(event.request)
						.then(function(res) {
							return caches.open(CACHE_DYNAMIC_NAME)
								.then(function(cache) {
									cache.put(event.request.url, res.clone());
									return res;
								})
						})
						.catch(function(err) {
							return caches.open(CACHE_STATIC_NAME)
								.then(function(cache) {
									return cache.match('/offline.html');
								});
						});
				}
			})
	);
});*/

// Network-with-cache-fallback
/*self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request)
			.then(function(res) {
				return caches.open(CACHE_DYNAMIC_NAME)
					.then(function(cache) {
						cache.put(event.request.url, res.clone());
						return res;
					})
			})
			.catch(function(err) 	{
				return caches.match(event.request)
			})
	);
});*/

// Cache-only strategy
/*self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
	);
});*/

// Network-only strategy
/*self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request)
	);
});*/