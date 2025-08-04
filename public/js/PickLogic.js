function insertLineItem(id, name, code, description, qty, price, status) {
  const container = document.querySelector('.data-view');
  
  const fields = [id, name, code, description, qty, price, status];
  fields.forEach(value => {
    const cell = document.createElement('div');
    cell.textContent = value;
    container.appendChild(cell);
  });
}


window.load = () => {
const submit = document.getElementById('pSubmit');

submit.addEventListener('click', () => {
    insertLineItem('◻', '12345', '12V Fan', 'Headquarters>Production Floor>Cage>Bin 2', '5', '37', '0');
    console.log('Line item inserted');
});
}