import View from './View.js';
import icons from 'url:../../img/icons.svg'; // 
import previewView from './previewView.js';
class bookmarkView extends View{
    _parentElement = document.querySelector('.bookmarks__list');
    _errorMessage = ' No bookmarks yet. Find a nice recipe and bookmark it :)';
    _message ='';

    _generateMarkup(){
        return this._data.map(res => previewView.render(res,false)).join('');
    }
    addHandlerender(handler){
        window.addEventListener('load',handler)
    }
    

    
   
}
export default new bookmarkView();