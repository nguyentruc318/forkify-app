import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
/////////////////////////////////

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
if(module.hot){
  module.hot.accept();
}
// console.log(icons);
const recipeContainer = document.querySelector('.recipe');


// https://forkify-api.herokuapp.com/v2


const controlRecipes = async function(){
  try{
    
    const id = window.location.hash.slice(1);
 
    if(!id) return ;
    recipeView.renderSpinner();
    resultsView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookMarks);
    //loadingRecipe
    await model.loadingRecipe(id);
    
    // rendering recipe;
    recipeView.render(model.state.recipe);
    //
  }catch(err){
    console.log(err);
    recipeView.renderError()
  }
};
const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if(!query) return ; 
    await model.loadSearchResult(query);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));
    // render initial pagination buttons 
    paginationView.render(model.state.search);
  }catch(err){
    console.log(err);
  }
};

const controlPagination = function(gotoPage){
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(gotoPage));
    bookmarkView.update(model.state.bookMarks);
    // render initial pagination buttons 
    paginationView.render(model.state.search);
}
const controlServings = function(newServing){
  // update the recipe servings (in state )
  model.updateServings(newServing);
  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}
const controlAddBookMArk = function(){
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);
  // update recipeView
  recipeView.update(model.state.recipe);
  // bookmarkview render
  bookmarkView.render(model.state.bookMarks);
}
const controlBookmarks = function(){
  bookmarkView.render(model.state.bookMarks);
}
const controlAddRecipe =async function(newRecipe){
  try{
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);
    // render recipe
    recipeView.render(model.state.recipe);
    // render message
    addRecipeView.renderMessage();
    //render bookmark view
    bookmarkView.render(model.state.bookMarks);
    //change ID in URl
    window.history.pushState(null ,'',`#${model.state.recipe.id}`);
    // window.history.back()
    // close form window
    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC*1000);
  }catch(err){
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}
const init = function(){
  bookmarkView.addHandlerender(controlBookmarks);
  recipeView.addHandleRender(controlRecipes);
  recipeView.addHandleUpdate(controlServings);
  recipeView.addHandlerAddBookMark(controlAddBookMArk);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  // controlRecipes();
}
init();
