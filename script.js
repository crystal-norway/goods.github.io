document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadAnnouncement();

    document.getElementById('addEventButton').addEventListener('click', function() {
        addNewEvent();
    });

    document.getElementById('clearButton').addEventListener('click', function() {
        // 清除公告栏数据
        localStorage.removeItem('announcement');
        document.getElementById('announcedData').innerText = '';
    });

    function addNewEvent(startTime, endTime, timeDiff) {
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event';

        const startButton = document.createElement('button');
        startButton.innerText = '开始';
        eventContainer.appendChild(startButton);

        const timeDiffSpan = document.createElement('span');
        timeDiffSpan.style.marginLeft = '10px';
        eventContainer.appendChild(timeDiffSpan);

        const saveButton = document.createElement('button');
        saveButton.innerText = '保存';
        saveButton.style.marginLeft = '10px';
        eventContainer.appendChild(saveButton);

        document.getElementById('eventsContainer').appendChild(eventContainer);

        if (startTime) {
            startButton.innerText = '结束';
            startButton.disabled = true;
            if (timeDiff) {
                timeDiffSpan.innerText = `时间差: ${timeDiff} 秒`;
            }
        }

        startButton.addEventListener('click', function() {
            if (startButton.innerText === '开始') {
                const startTime = new Date();
                startButton.innerText = '结束';
                startButton.setAttribute('data-startTime', startTime);
                saveEvent({ startTime: startTime.getTime() });
            } else if (startButton.innerText === '结束') {
                const endTime = new Date();
                const startTime = new Date(startButton.getAttribute('data-startTime'));
                const timeDiff = (endTime - startTime) / 1000;
                timeDiffSpan.innerText = `时间差: ${timeDiff} 秒`;
                startButton.disabled = true;
                saveEvent({ startTime: startTime.getTime(), endTime: endTime.getTime(), timeDiff: timeDiff });
            }
        });

        saveButton.addEventListener('click', function() {
            if (timeDiffSpan.innerText) {
                const announcement = timeDiffSpan.innerText;
                localStorage.setItem('announcement', announcement);
                document.getElementById('announcedData').innerText = announcement;
            }
        });

        if (startTime) {
            startButton.setAttribute('data-startTime', startTime);
        }
    }

    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => addNewEvent(event.startTime, event.endTime, event.timeDiff));
    }

    function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
    }

    function loadAnnouncement() {
        const announcement = localStorage.getItem('announcement');
        if (announcement) {
            document.getElementById('announcedData').innerText = announcement;
        }
    }
});
