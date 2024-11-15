document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    loadAnnouncement();
    updateTime();

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action) {
        handleAction(action);
    }
    
   document.getElementById('addEventButton').addEventListener('click', function () {
        const eventName = prompt('请输入事件名称:');
        if (eventName) {
            const note = prompt('请输入备注:');
            // 直接开始计时，设置开始时间为当前时间
            const startTime = new Date().getTime();
            addNewEvent(eventName, startTime, null, null, note);
        }
    });


    document.getElementById('clearAllButton').addEventListener('click', function () {
        localStorage.clear();
        location.reload();
    });

    document.getElementById('exportButton').addEventListener('click', function () {
        exportDataToCSV();
    });

     function addNewEvent(eventName, startTime, endTime, timeDiff, note = '') {
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event';
    
        const eventNameContainer = document.createElement('div');
        eventNameContainer.className = 'event-name-container';

        const noteContainer = document.createElement('div');
        noteContainer.className = 'note-container';
         
        const editButton = document.createElement('button');
        editButton.innerText = '✏️';
        editButton.className = 'edit-button';
        eventNameContainer.appendChild(editButton);
    
        let currentStartTime = startTime ? new Date(startTime) : new Date();
        let currentEndTime = endTime ? new Date(endTime) : new Date();
    
        editButton.addEventListener('click', function () {
            showDateTimeEditor(eventName, note, currentStartTime, currentEndTime, function(newEventName, newNote, newStartTime, newEndTime) {
                eventNameSpan.innerText = `事件名称: ${newEventName}`;
                noteSpan.innerText = `备注: ${newNote}`;
                startTimestampSpan.innerText = `开始时间: ${formatDateTime(newStartTime.getTime())}`;
                endTimestampSpan.innerText = `结束时间: ${formatDateTime(newEndTime.getTime())}`;
                const timeDiff = (newEndTime.getTime() - newStartTime.getTime()) / 1000;
                timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
    
                removeEvent(currentStartTime.getTime());
    
                currentStartTime = newStartTime;
                currentEndTime = newEndTime;
                eventName = newEventName;
                note = newNote;
    
                saveEvent({
                    eventName: newEventName,
                    startTime: newStartTime.getTime(),
                    endTime: newEndTime.getTime(),
                    timeDiff: timeDiff,
                    note: newNote
                });
            });
        });
        eventNameContainer.appendChild(editButton);
    
        const eventNameSpan = document.createElement('span');
        eventNameSpan.innerText = `事件名称: ${eventName}`;
        eventNameContainer.appendChild(eventNameSpan);
        eventContainer.appendChild(eventNameContainer);
    
        const noteSpan = document.createElement('span');
        noteSpan.innerText = `备注: ${note}`;
        noteContainer.appendChild(noteSpan);
        eventContainer.appendChild(noteContainer);
         
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
            document.getElementById('eventsContainer').removeChild(eventContainer);
            removeEvent(currentStartTime.getTime());
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
            currentStartTime = new Date();
            startButton.disabled = true;
            startTimestampSpan.innerText = `开始时间: ${formatDateTime(currentStartTime.getTime())}`;
            endButton.disabled = false;
            saveEvent({ eventName: eventName, startTime: currentStartTime.getTime() });
        });

        endButton.addEventListener('click', function () {
            currentEndTime = new Date();
            const timeDiff = (currentEndTime.getTime() - currentStartTime.getTime()) / 1000;
            endButton.disabled = true;
            endTimestampSpan.innerText = `结束时间: ${formatDateTime(currentEndTime.getTime())}`;
            timeDiffSpan.innerText = `时间差: ${formatTimeDiff(timeDiff)}`;
            saveEvent({ eventName: eventName, startTime: currentStartTime.getTime(), endTime: currentEndTime.getTime(), timeDiff: timeDiff });
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
        events.forEach(event => addNewEvent(event.eventName, event.startTime, event.endTime, event.timeDiff, event.note));
    }


   function saveEvent(event) {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        console.log('事件已保存:', event);
    }


    function removeEvent(startTime) {
        let events = JSON.parse(localStorage.getItem('events')) || [];
        events = events.filter(event => event.startTime !== startTime);
        localStorage.setItem('events', JSON.stringify(events));
        console.log('事件已删除:', startTime);
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
    
        let csvContent = "事件名称,备注,开始时间,结束时间,时间差\n";
        events.forEach(event => {
            const startTime = formatDateTime(event.startTime);
            const endTime = event.endTime ? formatDateTime(event.endTime) : '';
            const timeDiff = event.timeDiff ? formatTimeDiff(event.timeDiff) : '';
            const note = event.note || '';  // 获取备注
            csvContent += `${event.eventName},${note},${startTime},${endTime},${timeDiff}\n`;
        });
    
        try {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `events_${new Date().toISOString().substring(0, 10)}.csv`);
            link.style.display = 'none';
    
            document.body.appendChild(link);
            link.click();
    
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error('导出CSV失败:', error);
        }
    }
     function handleAction(action) {
        switch (action) {
            case 'addEvent':
                const eventName = prompt('请输入事件名称:');
                if (eventName) {
                    const note = prompt('请输入备注:');
                    addNewEvent(eventName, null, null, null, note);
                }
                break;

            // 你可以添加其他操作的 case
            default:
                console.warn(`未定义的操作: ${action}`);
        }
    }

     function showDateTimeEditor(eventName, note, start, end, callback) {
        const editor = document.getElementById('datetime-editor');
        document.getElementById('edit-event-name').value = eventName;
        
        const editNoteInput = document.createElement('input');
        editNoteInput.type = 'text';
        editNoteInput.id = 'edit-note';
        editNoteInput.placeholder = '备注';
        editNoteInput.value = note;
        editor.appendChild(editNoteInput);
    
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
            const newNote = document.getElementById('edit-note').value;
    
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
                callback(newEventName, newNote, newStartTime, newEndTime);
                editor.style.display = 'none';
            } else {
                alert('无效的时间输入或开始时间大于结束时间！');
            }
        };
    }

});
