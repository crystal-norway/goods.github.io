document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    loadAnnouncement();
    updateTime();

    document.getElementById('addEventButton').addEventListener('click', function () {
        addNewEvent();
    });

    document.getElementById('clearButton').addEventListener('click', function () {
        // 清除公告栏数据
        localStorage.removeItem('announcement');
        document.getElementById('announcedData').innerText = '';
    });

    document.getElementById('clearAllButton').addEventListener('click', function () {
        // 清除所有本地存储数据并刷新页面
        localStorage.clear();
        location.reload();
    });

    function addNewEvent(startTime, endTime, timeDiff) {
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event';

        const startButton = document.createElement('button');
        startButton.innerText = '开始';
        eventContainer.appendChild(startButton);

        const startTimestampSpan = document.createElement('span');
        startTimestampSpan.style.marginLeft = '10px';
        eventContainer.appendChild(startTimestampSpan);

        const endButton = document.createElement('button');
        endButton.innerText = '结束';
        endButton.style.marginLeft = '10px';
        endButton.disabled = true;
        eventContainer.appendChild(endButton);

        const endTimestampSpan = document.createElement('span');
        endTimestampSpan.style.marginLeft = '10px';
        eventContainer.appendChild(endTimestampSpan);

        const timeDiffSpan = document.createElement('span');
        timeDiffSpan.style.marginLeft = '10px';
        eventContainer.appendChild(timeDiffSpan);

        document.getElementById('eventsContainer').appendChild(eventContainer);

        if (startTime) {
            startButton.disabled = true;
            startTimestampSpan.innerText = `开始时间: ${new Date(startTime).toLocaleString()}`;
            endButton.disabled = false;
            startButton.setAttribute('data-startTime', startTime);
        }

        if (endTime) {
            endButton.disabled = true;
            endTimestampSpan.innerText = `结束时间: ${new Date(endTime).toLocaleString()}`;
            timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
        }

        startButton.addEventListener('click', function () {
            const startTime = new Date().getTime();
            startButton.disabled = true;
            startTimestampSpan.innerText = `开始时间: ${new Date(startTime).toLocaleString()}`;
            endButton.disabled = false;
            startButton.setAttribute('data-startTime', startTime);
            saveEvent({ startTime: startTime });
        });

        endButton.addEventListener('click', function () {
            const endTime = new Date().getTime();
            const startTime = parseInt(startButton.getAttribute('data-startTime'));
            const timeDiff = (endTime - startTime) / 1000;
            endButton.disabled = true;
            endTimestampSpan.innerText = `结束时间: ${new Date(endTime).toLocaleString()}`;
            timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
            saveEvent({ startTime: startTime, endTime: endTime, timeDiff: timeDiff });
        });
    }

    function formatTimeDiff(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => addNewEvent(event.startTime, event.endTime, event.timeDiff));
    }

    function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const updatedEvents = events.map(evt => {
            // 如果事件已经存在，则更新它
            if (evt.startTime === event.startTime) {
                return event;
            }
            return evt;
        });

        // 如果事件是新事件，则添加它
        if (!updatedEvents.some(evt => evt.startTime === event.startTime)) {
            updatedEvents.push(event);
        }

        localStorage.setItem('events', JSON.stringify(updatedEvents));
    }

    function loadAnnouncement() {
        const announcement = localStorage.getItem('announcement');
        if (announcement) {
            document.getElementById('announcedData').innerText = announcement;
        }
    }

    function updateTime() {
        setInterval(() => {
            const now = new Date();
            const formattedTime = now.getFullYear() + '/' +
                ('0' + (now.getMonth() + 1)).slice(-2) + '/' +
                ('0' + now.getDate()).slice(-2) + ' ' +
                ('0' + now.getHours()).slice(-2) + ':' +
                ('0' + now.getMinutes()).slice(-2) + ':' +
                ('0' + now.getSeconds()).slice(-2);
            document.getElementById('currentTime').innerText = formattedTime;
        }, 1000);
    }
});
