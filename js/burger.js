import {restartMaze} from './script.js';

const burger = document.getElementById('burger');
const popup = document.querySelector('.popup__content');
const run = document.querySelector('.popup__btn_run');
const popupForm = document.querySelector(".popup__form");

const togglePopup = () => {
    burger.classList.toggle('active');
    popup.classList.toggle('hidden');
    if(burger.classList.contains('active')){
        popupForm.classList.remove('nodisplay');
    }else{
        setTimeout(()=>{
            popupForm.classList.add('nodisplay');
        },500)
    }
}
burger.addEventListener('click', function(){
    togglePopup();
})
run.addEventListener('click', function(e){
    e.preventDefault();
    const formData = new FormData(popupForm);
    restartMaze(formData);
    togglePopup();
})
