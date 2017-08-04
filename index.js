(function() {
  class MyForm {
    constructor(form, resultContainer) {
      if (!form) throw new Error('Нет формы');
      else if (!resultContainer) throw new Error('Нет контейнера для ответа');

      form.setAttribute('novalidate', true);

      this.input = {
        fio: form.querySelector('[name="fio"]'),
        email: form.querySelector('[name="email"]'),
        phone: form.querySelector('[name="phone"]')
      };

      this.submitButton = form.querySelector('#submitButton');
      this.resultContainer = resultContainer;
      
      this.allowedDomains = [
        'ya.ru',
        'yandex.ru',
        'yandex.ua',
        'yandex.by',
        'yandex.kz',
        'yandex.com'
      ];

      form.onsubmit = (e) => {
        e.preventDefault();

        this.submit();
      };

      return {
        validate: this.validate.bind(this),
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        submit: this.submit.bind(this)
      };
    }

    validate() {
      const errorFields = [];

      if (!this.isValidFio(this.input.fio.value)) {
        errorFields.push('fio');
      }

      if (!this.isValidEmail(this.input.email.value)) {
        errorFields.push('email');
      }

      if (!this.isValidPhone(this.input.phone.value)) {
        errorFields.push('phone');
      }

      return {
        isValid: errorFields.length === 0,
        errorFields
      };
    }

    getData() {
      const inputData = {};
      const inputs = this.input;

      Object.keys(inputs).forEach((name) => {
        inputData[name] = inputs[name].value;
      });

      return inputData;
    }

    setData(data) {
      const inputs = this.input;

      Object.keys(inputs).forEach((name) => {
        if (data[name]) {
          inputs[name].value = data[name];
        }
      });
    }

    submit() {
      this.removeErrors();

      const validateResult = this.validate();

      if (validateResult.isValid) {
        Object.values(this.input).forEach((field) => field.classList.remove('error'));
        this.submitButton.disabled = true;
        this.send();
      } else {
        validateResult.errorFields.forEach((fieldName) => {
          this.input[fieldName].classList.add('error');
        });
      }
    }

    send() {
      const url = this.submitButton.form.action;
      const xhr = new XMLHttpRequest();

      console.log('send');

      xhr.onload = (response) => {
        const json = JSON.parse(response.target.responseText);

        this.showResult(json);
      };

      xhr.open('GET', url);
      xhr.send();
    }

    showResult(response) {
      const status = response.status;

      this.resultContainer.removeAttribute('class');
      this.resultContainer.innerHTML = '';

      switch (status) {
        case 'success': {
          this.resultContainer.classList.add('success');

          this.resultContainer.innerHTML = 'Success';

          break;
        }
        case 'error': {
          this.resultContainer.classList.add('error');

          this.resultContainer.innerHTML = response.reason;

          break;
        }
        case 'progress': {
          console.log('progress');
          const ms = response.timeout;

          this.resultContainer.classList.add('progress');

          setTimeout(() => this.send(), ms);

          break;
        }
      }
    }

    removeErrors() {
      Object.values(this.input).forEach((element) => element.classList.remove('error'));
    }

    phoneNumSum(phone) {
      const reg = /\d/g;
      const numbers = phone.match(reg);

      return numbers ? numbers.reduce((acc, current) => +acc + +current) : null;
    };

    isValidFio(fio) {
      return fio.trim().split(' ').filter((word) => word !== '').length === 3;
    }

    isValidEmail(email) {
      const atSignPosition = email.indexOf('@');
      const domainName = email.slice(atSignPosition + 1);

      return this.allowedDomains.some((domain) => domain === domainName);
    }

    isValidPhone(phone) {
      const reg = /\+7\(\d{3}\)\d{3}\-\d{2}\-\b\d{2}\b/;
      const patternParse = phone.trim().match(reg);

      return patternParse && this.phoneNumSum(phone) <= 30;
    }
  }

  const form = document.querySelector('#myForm');
  const resultContainer = document.querySelector('#resultContainer');
  
  window.MyForm = new MyForm(form, resultContainer);
})();