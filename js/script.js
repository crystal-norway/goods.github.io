document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    loadAnnouncement();
    updateTime();

    document.getElementById('addEventButton').addEventListener('click', function () {
        const eventName = prompt('请输入事件名称:');
        if (eventName) {
            addNewEvent(eventName);
        }
    });

    document.getElementById('clearButton').addEventListener('click', function () {
        localStorage.removeItem('announcement');
        document.getElementById('announcedData').innerText = '';
    });

    document.getElementById('clearAllButton').addEventListener('click', function () {
        localStorage.clear();
        location.reload();
    });

    document.getElementById('exportButton').addEventListener('click', function () {
        exportDataToCSV();
    });

    function addNewEvent(eventName, startTime, endTime, timeDiff) {
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event';

        const eventNameContainer = document.createElement('div');
        eventNameContainer.className = 'event-name-container';

        const editButton = document.createElement('button');
        editButton.innerText = '✏️';
        editButton.className = 'edit-button';
        editButton.addEventListener('click', function () {
            const start = startTime ? new Date(startTime) : new Date();
            const end = endTime ? new Date(endTime) : new Date();
            showDateTimeEditor(eventName, start, end, function(newEventName, newStartTime, newEndTime) {
                eventNameSpan.innerText = `事件名称: ${newEventName}`;
                startTimestampSpan.innerText = `开始时间: ${formatDateTime(newStartTime.getTime())}`;
                endTimestampSpan.innerText = `结束时间: ${formatDateTime(newEndTime.getTime())}`;
                const timeDiff = (newEndTime.getTime() - newStartTime.getTime()) / 1000;
                timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
                updateEventInStorage(startTime, {
                    eventName: newEventName,
                    startTime: newStartTime.getTime(),
                    endTime: newEndTime.getTime(),
                    timeDiff: timeDiff
                });
            });
        });
        eventNameContainer.appendChild(editButton);

        const eventNameSpan = document.createElement('span');
        eventNameSpan.innerText = `事件名称: ${eventName}`;
        eventNameContainer.appendChild(eventNameSpan);

        eventContainer.appendChild(eventNameContainer);

        const startButton = document.createElement('button');
        startButton.innerText = '开始';
        startButton.style.marginLeft = '10px';
        startButton.className = 'primary-button';
        eventContainer.appendChild(startButton);

        const startTimestampSpan = document.createElement('span');
        startTimestampSpan.style.marginLeft = '10px';
        eventContainer.appendChild(startTimestampSpan);

        const endButton = document.createElement('button');
        endButton.innerText = '结束';
        endButton.style.marginLeft = '10px';
        endButton.disabled = true;
        endButton.className = 'secondary-button';
        eventContainer.appendChild(endButton);

        const endTimestampSpan = document.createElement('span');
        endTimestampSpan.style.marginLeft = '10px';
        eventContainer.appendChild(endTimestampSpan);

        const timeDiffSpan = document.createElement('span');
        timeDiffSpan.style.marginLeft = '10px';
        eventContainer.appendChild(timeDiffSpan);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '✖';
        deleteButton.addEventListener('click', function () {
            eventsContainer.removeChild(eventContainer);
            removeEvent(startTime);
        });
        eventContainer.appendChild(deleteButton);

        document.getElementById('eventsContainer').appendChild(eventContainer);

        if (startTime) {
            startButton.disabled = true;
            startTimestampSpan.innerText = `开始时间: ${formatDateTime(startTime)}`;
            endButton.disabled = false;
        }

        if (endTime) {
            endButton.disabled = true;
            endTimestampSpan.innerText = `结束时间: ${formatDateTime(endTime)}`;
            timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
        }

        startButton.addEventListener('click', function () {
            startTime = new Date().getTime();
            startButton.disabled = true;
            startTimestampSpan.innerText = `开始时间: ${formatDateTime(startTime)}`;
            endButton.disabled = false;
            saveEvent({ eventName: eventName, startTime: startTime });
        });

        endButton.addEventListener('click', function () {
            const endTime = new Date().getTime();
            const timeDiff = (endTime - startTime) / 1000;
            endButton.disabled = true;
            endTimestampSpan.innerText = `结束时间: ${formatDateTime(endTime)}`;
            timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
            saveEvent({ eventName: eventName, startTime: startTime, endTime: endTime, timeDiff: timeDiff });
        });
    }

    function formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hour = ('0' + date.getHours()).slice(-2);
        const minute = ('0' + date.getMinutes()).slice(-2);
        const second = ('0' + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    function formatTimeDiff(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function loadEvents() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.forEach(event => addNewEvent(event.eventName, event.startTime, event.endTime, event.timeDiff));
    }

    function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        const updatedEvents = events.map(evt => {
            if (evt.startTime === event.startTime) {
                return event;
            }
            return evt;
        });

        if (!updatedEvents.some(evt => evt.startTime === event.startTime)) {
            updatedEvents.push(event);
        }

        localStorage.setItem('events', JSON.stringify(updatedEvents));
    }

    function removeEvent(startTime) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.startTime !== startTime);
        localStorage.setItem('events', JSON.stringify(events));
    }

    function updateEventInStorage(originalStartTime, updatedEvent) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.map(event => {
            if (event.startTime === originalStartTime) {
                return updatedEvent;
            }
            return event;
        });
        localStorage.setItem('events', JSON.stringify(events));
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
            const formattedTime = formatDateTime(now.getTime());
            document.getElementById('currentTime').innerText = formattedTime;
        }, 1000);
    }

    function exportDataToCSV() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        if (events.length === 0) {
            alert('没有可导出的事件数据');
            return;
        }

        let csvContent = "事件名称,开始时间,结束时间,时间差\n";
        events.forEach(event => {
            const startTime = formatDateTime(event.startTime);
            const endTime = event.endTime ? formatDateTime(event.endTime) : '';
            const timeDiff = event.timeDiff ? formatTimeDiff(event.timeDiff) : '';
            csvContent += `${event.eventName},${startTime},${endTime},${timeDiff}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        const now = new Date();
        const year = now.getFullYear();
        const month = ('0' + (now.getMonth() + 1)).slice(-2);
        const day = ('0' + now.getDate()).slice(-2);
        const formattedDate = `${year}_${month}_${day}`;
        
        const fileName = `events_${formattedDate}.csv`;
        link.download = fileName;

        link.href = URL.createObjectURL(blob);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showDateTimeEditor(eventName, start, end, callback) {
        const editor = document.getElementById('datetime-editor');
        document.getElementById('edit-event-name').value = eventName;
        
        document.getElementById('start-year').value = start.getFullYear();
        document.getElementById('start-month').value = start.getMonth() + 1;
        document.getElementById('start-day').value = start.getDate();
        document.getElementById('start-hour').value = start.getHours();
        document.getElementById('start-minute').value = start.getMinutes();
        document.getElementById('start-second').value = start.getSeconds();

        document.getElementById('end-year').value = end.getFullYear();
        document.getElementById('end-month').value = end.getMonth() + 1;
        document.getElementById('end-day').value = end.getDate();
        document.getElementById('end-hour').value = end.getHours();
        document.getElementById('end-minute').value = end.getMinutes();
        document.getElementById('end-second').value = end.getSeconds();
        
        editor.style.display = 'block';
        
        document.getElementById('save-datetime').onclick = function() {
            const newEventName = document.getElementById('edit-event-name').value;
            
            const newStartYear = document.getElementById('start-year').value;
            const newStartMonth = document.getElementById('start-month').value - 1;
            const newStartDay = document.getElementById('start-day').value;
            const newStartHour = document.getElementById('start-hour').value;
            const newStartMinute = document.getElementById('start-minute').value;
            const newStartSecond = document.getElementById('start-second').value;
            
            const newEndYear = document.getElementById('end-year').value;
            const newEndMonth = document.getElementById('end-month').value - 1;
            const newEndDay = document.getElementById('end-day').value;
            const newEndHour = document.getElementById('end-hour').value;
            const newEndMinute = document.getElementById('end-minute').value;
            const newEndSecond = document.getElementById('end-second').value;

            const newStartTime = new Date(newStartYear, newStartMonth, newStartDay, newStartHour, newStartMinute, newStartSecond);
            const newEndTime = new Date(newEndYear, newEndMonth, newEndDay, newEndHour, newEndMinute, newEndSecond);
            
            if (!isNaN(newStartTime.getTime()) && !isNaN(newEndTime.getTime()) && newStartTime < newEndTime) {
                callback(newEventName, newStartTime, newEndTime);
                editor.style.display = 'none';
            } else {
                alert('无效的时间输入或开始时间大于结束时间！');
            }
        };
    }
});
