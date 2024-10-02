/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/js/editor.js
class ProductTable {
  constructor() {
    this._addButton = document.querySelector('.create');
    this._cancelBtn = document.querySelector('#cancel');
    this._addBtn = document.querySelector('#add');
    this._updBtn = document.querySelector('#update');
    this._addNewDataBlock = document.querySelector('.main-create-block');
    this._tabelRows = document.querySelectorAll('tr').length;
    this._alertBlock = document.querySelector('.main-alert-block');
    this.current = [];
    this.descriptionInput = this._addNewDataBlock.querySelector('#description');
    this.nameInput = this._addNewDataBlock.querySelector('#name');
    this.createTableBlock = document.querySelector('.create-table-block');
    this.currentId;
  }
  init() {
    this._addButton.addEventListener('click', this.createData.bind(this));
    document.querySelector('table').addEventListener('click', this.editData.bind(this));
    document.querySelector('table').addEventListener('click', this.deleteData.bind(this));
    document.querySelector('table').addEventListener('click', this.changeStatus.bind(this));
    this._cancelBtn.addEventListener('click', this.closeBlock.bind(this));
    this._addBtn.addEventListener('click', this.addData.bind(this));
    this._updBtn.addEventListener('click', this.updData.bind(this));
  }
  setTableRowHTML(id, name, description) {
    return `
        <tr data-id="${id}">
            <td class="status-block">
                <label for="change-status" class="status-btn">
                    <input type="checkbox" id="change-status" class="visually-hidden">
                </label>
            </td>
            <td>${name}</td>
            <td>${description}</td>
            <td>
                <div class="chexbox-btn">
                    <label for="edit-data${this._tabelRows}" class="table-row edit">
                        <input type="checkbox" id="edit-data${this._tabelRows}" class="visually-hidden">
                    </label>
                    <label for="delete-data${this._tabelRows}" class="table-row delete">
                        <input type="checkbox" id="delete-data${this._tabelRows}" class="visually-hidden">
                    </label>
                </div>
            </td>
        </tr>`;
  }
  createData() {
    if (this._addBtn.classList.contains('_hidden')) {
      this._addBtn.classList.remove('_hidden');
    }
    this._addNewDataBlock.classList.remove('_hidden');
    this._updBtn.classList.add('_hidden');
  }
  async editData(e) {
    if (this._updBtn.classList.contains('_hidden')) {
      this._updBtn.classList.remove('_hidden');
    }
    this._addBtn.classList.add('_hidden');
    if (e.target.classList.contains('edit')) {
      this.current = [...e.target.closest('tr').querySelectorAll('td')].slice(1, 3);
      this.currentId = e.target.closest('tr').dataset.id;
      this._addNewDataBlock.classList.remove('_hidden');
      const urlParam = `method=ticketById&id=${encodeURIComponent(this.currentId)}`;
      const response = await this.setXMLRequest('GET', urlParam);
      this._addNewDataBlock.querySelector('#name').value = response.name;
      this._addNewDataBlock.querySelector('#description').value = response.description;
    }
  }
  async deleteData(e) {
    // e.preventDefault()
    if (e.target.classList.contains('delete')) {
      this._alertBlock.classList.remove('_hidden');
      this._alertBlock.querySelector('#yes').onclick = async el => {
        el.preventDefault();
        e.target.closest('tr').remove();
        this._alertBlock.classList.add('_hidden');
        const urlParam = `method=deleteTicket&id=${encodeURIComponent(e.target.closest('tr').dataset.id)}`;
        await this.setXMLRequest('DELETE', urlParam);
      };
      this._alertBlock.querySelector('#no').onclick = e => {
        e.preventDefault();
        this._alertBlock.classList.add('_hidden');
      };
    }
  }
  closeBlock(e = undefined) {
    if (e) e.preventDefault();
    [...this._addNewDataBlock.querySelectorAll('input')].forEach(elem => {
      elem.value = '';
    });
    this._addNewDataBlock.classList.add('_hidden');
  }
  async addData(e) {
    e.preventDefault();
    if (this.checkValidity()) {
      return;
    }
    const name = this._addNewDataBlock.querySelector('#name').value;
    const urlParam = `method=createTicket`;
    const response = await this.setXMLRequest('POST', urlParam, true);
    const result = this.setTableRowHTML(response.id, name, response.created);
    document.querySelector('table tbody').insertAdjacentHTML('beforeend', result);
    this.currentTicket = this.currentTicket.bind(this);
    document.querySelector('table tbody').lastChild.querySelectorAll('td')[1].addEventListener('click', this.currentTicket);
    this.closeBlock();
  }
  async updData(e) {
    e.preventDefault();
    const [name, description] = this.current;
    if (this.checkValidity()) {
      return;
    }
    const urlParam = `method=updateTicket&id=${encodeURIComponent(this.currentId)}`;
    const response = await this.setXMLRequest('PATCH', urlParam, true);
    name.textContent = response.name;
    description.textContent = response.created;
    this.closeBlock();
  }
  async changeStatus(e) {
    if (e.target.classList.contains('status-btn')) {
      e.target.classList.toggle('active-status');
      e.target.closest('tr').classList.toggle('active-row');
      const urlParam = `method=statusTicket&id=${encodeURIComponent(e.target.closest('tr').dataset.id)}`;
      await this.setXMLRequest('PATCH', urlParam);
    }
  }
  async currentTicket(e) {
    if (e.target.closest('tr').querySelector('.active-desc')) {
      e.target.closest('tr').querySelector('.active-desc').remove();
      return;
    }
    if (e.target.closest('tr')) {
      const id = e.target.closest('tr').dataset.id;
      const urlParam = `method=ticketById&id=${encodeURIComponent(id)}`;
      const response = await this.setXMLRequest('GET', urlParam);
      const name = e.target.closest('tr').querySelectorAll('td')[1];
      const div = document.createElement('div');
      div.textContent = response.description;
      div.classList.add('active-desc');
      name.append(div);
    }
  }
  checkValidity() {
    let result = false;
    if (this.descriptionInput.value == '') {
      this.showError(this.descriptionInput, 'Пустое значение');
      result = true;
    } else {
      this.hideError(this.descriptionInput);
    }
    if (this.nameInput.value == '') {
      this.showError(this.nameInput, 'Пустое значение');
      result = true;
    } else {
      this.hideError(this.nameInput);
    }
    return result;
  }
  showError(input, message) {
    const errorText = input.previousElementSibling.querySelector('.error-text');
    errorText.textContent = message;
    if (errorText.classList.contains('_hidden')) {
      errorText.classList.remove('_hidden');
    }
  }
  hideError(input) {
    const errorText = input.previousElementSibling.querySelector('.error-text');
    if (!errorText.classList.contains('_hidden')) {
      errorText.classList.add('_hidden');
    }
  }
  setXMLRequest(method, urlParam, form = false) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `http://localhost:3000/?${urlParam}`);
      if (form) {
        const formData = new FormData(this.createTableBlock);
        xhr.send(formData);
      } else {
        xhr.send();
      }
      xhr.addEventListener('load', () => {
        const result = JSON.parse(xhr.response);
        resolve(result[result.length - 1]);
      });
    });
  }
}
;// ./src/js/app.js

const obj = new ProductTable();
obj.init();
;// ./src/index.js


/******/ })()
;