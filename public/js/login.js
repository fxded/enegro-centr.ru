//ajax(url, method, functionName, dataArray)


document.querySelector('#loginBtn').onclick = function () {
    let email = document.querySelector('#login-email').value,
        password = document.querySelector('#login-password').value,
        data = JSON.stringify({ email: email,
                                password: password  });

    ajax('/login', 'POST', toProfile, data);
}

function toProfile(data) {
    let answer = JSON.parse(data.response);
    if (answer.error) {
        console.log('user cred11: ', answer);
    } else {
//        document.querySelector('body').innerHTML = answer.data;
        document.location.href = answer.file;
        console.log('user cred: ', answer);
    }
}
