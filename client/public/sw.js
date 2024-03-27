self.addEventListener("push", (event) => {
    try {
        let { title, body, icon, tag } = JSON.parse(event.data && event.data.text());

        event.waitUntil(
            self.registration.showNotification(title || "", { body, tag, icon })
        );
    } catch (error) {
        console.error(error);
    }
});

self.addEventListener("notificationclick", function (event) {
    try {
        event.notification.close();

        const urlToOpen = "https://chat.baejangho.com";

        event.waitUntil(
            self.clients
                .matchAll({
                    type: "window",
                    includeUncontrolled: true
                })
                .then(function (clientList) {
                    if (clientList.length > 0) {
                        return clientList[0].focus().then((client) => client.navigate(urlToOpen));
                    }
                    return self.clients.openWindow(urlToOpen);
                })
        );
    } catch (error) {
        console.error(error);
    }
});