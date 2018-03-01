// app.js전역에 떄려박음
// 함수를 여러개 만들어서 아무데서나 뒤죽박죽 호출한다
// 개선 => 하나의 일은 하나의 모듈에서 할 수 있도록


var counter = {
  _value: 1,
  get value() {
    return this._value;
  },
  set value(val) {
    if (val < 1) return;
    if (val > 9) return;
    this._value = val;
    document.getElementById('digit-number').innerHTML = this._value;
  },
  init: function () {
    document.getElementById('plus-btn').addEventListener('click', function (e) {
      counter.value += 1;
      console.log('plus clicked');
    });

    document.getElementById('minus-btn').addEventListener('click', function (e) {
      counter.value -= 1;
      console.log('minus clicked');
    });

    document.getElementById('digit-number').innerHTML = this._value;
  }
};
counter.init();

function createDotInputControl(digitNumber, callback) {
  var inputContainer = document.querySelector('.digit-input-container'),
    inputElementText = '';

  for (let index = 0; index < digitNumber; index++) {
    inputElementText += `
    <input type="text" maxlength="1" class="digit-input" placeholder="•">
    `
  }
  inputContainer.innerHTML = inputElementText;
  // 키가 눌렸을 때
  inputContainer.addEventListener('keydown', function (e) {
    var charCode = e.keyCode;
    console.log(e.witch)
    if (e.target.className === 'digit-input') {
      // 좌 우 뒤로가기 탭 키가 눌리면 retrun
      if (charCode === 37 ||
        charCode === 8 ||
        charCode === 46 ||
        charCode === 39 ||
        charCode === 32) {
        return;
      }

      if (charCode === 13 && e.target === e.target.parentElement.lastElementChild) {
        var arrOfInputs = Array.prototype.slice.call(e.target.parentElement.children);
        var values = arrOfInputs.map(v => Number(v.value));
        arrOfInputs.forEach(function (v) {
          v.value = null;
        })
        e.target.parentElement.firstElementChild.select();
        callback.call(null, values);
        console.log(arrOfInputs);
      }

      // 숫자가 아니면 이벤트 전파를 시키지 않는다
      if (!/[0-9]/.test(Number(String.fromCharCode(charCode)))) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  });

  // 키를 눌렀다 떼었을 때 
  inputContainer.addEventListener('keyup', function (e) {
    var charCode = e.keyCode,
      previousSibling = e.target.previousElementSibling,
      nextElementSibling = e.target.nextElementSibling;
    if (e.target.className === 'digit-input') {
      if (previousSibling) {
        // 이전 엘리먼트 요소가 있을 때 좌, 딜리트 
        if (charCode === 37 || charCode === 8 || charCode === 46) {
          previousSibling.select();
          previousSibling.focus();
          return;
        }
      }
      if (nextElementSibling) {
        // 이전 엘리먼트 요소가 있을 때 우, 탭
        if (charCode === 39 || charCode === 32) {
          nextElementSibling.select();
          return;
        }
        // 해당 자리가 채워지면 다음요소로 넘기기
        if (e.target.value !== "") {
          nextElementSibling.select();
        }
      }
    }
  });
}

function startGame(digit) {
  var resultContainer = document.querySelector('.result-container');
  var problem = makeProblem(digit);
  document.querySelector('.digit-selector').style.display = 'none';
  document.querySelector('.game-main').style.display = 'block';
  createDotInputControl(digit, function (numbers) {
    var result = getResult(problem, numbers);
    resultContainer.insertAdjacentHTML('beforeend', createResultEl(numbers, result));
    if (result === digit + 'S0B') {
      alert('정답을 맞추셨습니다.');
      resetGame();
    }
    console.log(problem, result);
  });
}

function createResultEl(numbers, result) {
  return `<li class="list-group-item">
    <span class="guess">${numbers}</span>
    <span class="badge result">${result}</span>
  </li>`;
}

function resetGame() {
  //removeChild를 하면 문제가 생김, addEventListener는 삭제되지 않고 누적되는 현상이 나타남
  //그래서 복제 후 
  var preEl = document.querySelector('.digit-input-container');
  var clonedEl = preEl.cloneNode(false); //기존의 자식을 버림, 얕은 복사
  preEl.parentNode.replaceChild(clonedEl, preEl);

  document.querySelector('.result-container').innerHTML = '';
  document.querySelector('.digit-selector').style.display = 'block';
  document.querySelector('.game-main').style.display = 'none';
}

document.querySelector('#start-btn').addEventListener('click', function (e) {
  e.preventDefault();
  startGame(counter.value);
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 고민해봐
function makeProblem(digit) {
  var problem = [],
    numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 0; i < digit; i++) {
    var max = 9 - i,
      index = getRandomInt(0, max); problem.push(numbers[index]); numbers.splice(index, 1);
  };
  return problem;
}

function getResult(problem, guess) {
  var result = "",
    strike = 0, ball = 0;
  for (var i = 0; i < problem.length; i++) {
    if (guess[i] === problem[i]) {
      strike++;
    } else if (problem.indexOf(guess[i]) > -1) {
      ball++;
    }
  }
  if (strike === 0 && ball === 0) {
    result = "OUT";
  } else {
    result = strike + "S" + ball + "B";
  }
  return result;
}