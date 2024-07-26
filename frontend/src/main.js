import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, apiCallPost, apiCallGet, apiCallPut, formatDate } from './helpers.js';

let globalToken = null;
let globalUserId = null;
let displayAll = false;
let editingChannelId = null;
if (localStorage.getItem('token') !== null) {
    globalToken = localStorage.getItem('token');
}
if (localStorage.getItem('userId') !== null) {
    globalUserId = localStorage.getItem('userId');
}
if (localStorage.getItem('editingChannelId') !== null) {
    editingChannelId = localStorage.getItem('editingChannelId');
}

const joinOrLeaveChannel = (id, option) => {
    apiCallPost(`/channel/${id}/${option}`, {
        "channelId": id,
    }, globalToken)
    .then((data) => {
        displayChannel(displayAll);
    })
    .catch((msg) => {
        alert(msg)
    });
}

// param {channelid, channelmembers}
const viewChannelDetail = (id, members) => {
    const name = document.getElementById('channel-detail-name');
    const creator = document.getElementById('channel-detail-creator');
    const description = document.getElementById('channel-detail-description');
    const privateType = document.getElementById('channel-detail-channelType1');
    const publicType = document.getElementById('channel-detail-channelType2');
    const createdAt = document.getElementById('channel-detail-createdAt');

    apiCallGet(`/channel/${id}`,{}, globalToken)
    .then(data => {
        name.value = data.name;
        apiCallGet(`/user/${data.creator}`,{}, globalToken)
        .then(data => {
            creator.value = data.name;
        })
        .catch((msg) => {
            alert(msg)
        });
        description.value = data.description;
        privateType.checked = data.private;
        publicType.checked = !data.private;
        createdAt.value = formatDate(data.createdAt);
    })
    .catch((msg) => {
        alert(msg)
    });
    creator.setAttribute('readonly', '');
    privateType.setAttribute('disabled', '');
    publicType.setAttribute('disabled', '');
    createdAt.setAttribute('readonly', '');
}

const createChannelElement = (item) => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';
    listItem.textContent = item.name;

    const lockIcon = document.createElement('i');
    lockIcon.className = 'fa-solid fa-lock';
    lockIcon.style.margin = '5px';
    if (item.private) {
        listItem.appendChild(lockIcon);
    }
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'btn btn-secondary btn-sm';
    viewBtn.textContent = 'View';
    viewBtn.style.margin = '10px';
    viewBtn.setAttribute('data-bs-toggle', 'modal');
    viewBtn.setAttribute('data-bs-target', '#staticBackdrop1');
    viewBtn.addEventListener('click', () => {
        editingChannelId = item.id;
        localStorage.setItem('editingChannelId', item.id);
        viewChannelDetail(item.id, item.members);
    })
    viewBtn.disabled = !item.members.includes(parseInt(globalUserId, 10));
    listItem.appendChild(viewBtn);

    const joinBtn = document.createElement('button');
    joinBtn.type = 'button';
    joinBtn.className = 'btn btn-secondary btn-sm';
    joinBtn.textContent = 'Join';
    joinBtn.style.display = item.members.includes(parseInt(globalUserId, 10)) ? 'none' : 'inline block';
    joinBtn.style.margin = '10px';
    joinBtn.disabled = item.private;
    joinBtn.addEventListener('click', () => {
        console.log("Join the channel!");
        joinOrLeaveChannel(item.id, 'join');
    })
    listItem.appendChild(joinBtn);

    const leaveBtn = document.createElement('button');
    leaveBtn.type = 'button';
    leaveBtn.className = 'btn btn-secondary btn-sm';
    leaveBtn.textContent = 'Leave';
    leaveBtn.style.display = item.members.includes(parseInt(globalUserId, 10)) ? 'inline block' : 'none';
    leaveBtn.style.margin = '10px';
    leaveBtn.addEventListener('click', () => {
        console.log("leava the channel!");
        joinOrLeaveChannel(item.id, 'leave');
    })
    listItem.appendChild(leaveBtn);
    
    return listItem;
}

const displayChannel = (displayAll) => {
    const channelList = document.getElementById('channels-list');
    // remove the child until no child exist
    while(channelList.firstChild) {
        channelList.removeChild(channelList.firstChild);
    }

    let channels = [];
    apiCallGet('/channel',{}, globalToken)
    .then(data => {
        channels = data.channels;
        // display channel on dashboard
        channels.forEach(item => {

            if (item.members.includes(parseInt(globalUserId, 10)) || displayAll) {
                const listItem = createChannelElement(item);
                channelList.appendChild(listItem);
            }
        });
    })
    .catch((msg) => {
        alert(msg)
    });
}

const showPage = (pageName) => {
    for (const page of document.querySelectorAll('.page-block')) {
        page.style.display = 'none';
    }
    document.getElementById(`page-${pageName}`).style.display = 'block';

    if (pageName === 'dashboard') {
        displayChannel(displayAll);
    }
}

// Submit Button for Registration 
const submitBtn = document.getElementById('register-submit');
submitBtn.addEventListener('click', (e) => {
    const email = document.getElementById('register-email').value;
    const name = document.getElementById('register-name').value;
    const pass = document.getElementById('register-pass').value;
    const passConfirm = document.getElementById('register-pass-confirm').value;
    if (pass !== passConfirm) {
        alert('Passwords need to match');
    }
    else {
        apiCallPost('/auth/register', {
            "email": email,
            "password": pass,
            "name": name,
        }, null)
        .then((data) => {
            const { token, userId } = data;
            globalToken = token;
            globalUserId = userId;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            showPage('dashboard');
        })
        .catch((msg) => {
            alert(msg)
        });
    }
}) 

// Logout Button 
const logoutBtn = document.getElementById('logout');
logoutBtn.addEventListener('click', (e) => {
    apiCallPost('/auth/logout', {}, globalToken)
    .then((data) => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        showPage('register');
    })
    .catch((msg) => {
        alert(msg)
    });
})

// Login submit button 
const loginBtn = document.getElementById('login-btn');
loginBtn.addEventListener('click', () => {
	const email = document.getElementById('login-email').value;
	const pass = document.getElementById('login-pass').value;
    apiCallPost('/auth/login', {
        "email": email,
        "password": pass,
    }, null)
    .then((data) => {
        const { token, userId } = data;
        globalToken = token;
        globalUserId = userId;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        showPage('dashboard');
    })
    .catch((msg) => {
        alert(msg)
    });
})

// redirecting the page 
for (const redirect of document.querySelectorAll('.redirect')) {
    const newPage = redirect.getAttribute('redirect');
    redirect.addEventListener('click', () => showPage(newPage));
}

// if not login then go to register page else then show dashboard 
if (globalToken === null) {
    showPage('register');
}
else {
    showPage('dashboard');
}

// Create channel 
const createChannelBtn = document.getElementById('channel-create-btn');
createChannelBtn.addEventListener('click', () => {
    const channelName = document.getElementById('channel-name').value;
    const privateType = document.getElementById('channelType1').checked;
    const publicType = document.getElementById('channelType2').checked;
    const channelDescription = document.getElementById('channel-description').value;
    if (!channelName) {
        alert('Please provide a channel name');
    } else if (privateType === false && publicType === false) {
        alert('Please provide a channel type');
    } else {
        apiCallPost('/channel', {
            "name": channelName,
            "private": privateType,
            "description": channelDescription === '' ? "Description not provided" : channelDescription,
        }, globalToken)
        .then((data) => {
            const { channelId } = data;

            // refetch the updated channels list
            displayChannel();
        })
        .catch((msg) => {
            alert(msg)
        });
    }
})

const displayOption = document.getElementById('display-all-checkbox');

displayOption.addEventListener('change', () => {
    displayAll = displayOption.checked;
    displayChannel(displayAll);
})

const saveChangesBtn = document.getElementById('save-changes-btn');

saveChangesBtn.addEventListener('click', () => {
    const name = document.getElementById('channel-detail-name').value;
    const description = document.getElementById('channel-detail-description').value;
    if (name !== '') {
        apiCallPut(`/channel/${editingChannelId}`, {
            "name": name,
            "description": description === '' ? "Description not provided" : description,
        }, globalToken)
        .then((data) => {
            console.log('Successfully put the changes!');
            displayChannel(displayAll);
        })
        .catch((msg) => {
            alert(msg)
        });
    } else {
        alert('Please provide a channel name.');
    }
})