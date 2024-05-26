import { async } from "regenerator-runtime";
import { API_URL,RES_PER_PAGE,KEY} from "./config.js";
// import { getJSON ,sendJSON} from "./helpers.js";
import { AJAX } from "./helpers.js";
import bookmarkView from "./views/bookmarkView.js";
// import { startsWith } from "core-js/core/string";

export const state ={
    recipe:{},
    search:{
        query:'',
        results:[],
        page:1,
        resultsPerPage :RES_PER_PAGE,
    },
    bookMarks:[]
};
const createRecipeObject =function(data){
    const {recipe} = data.data;
    return     {
            id:recipe.id,
            title:recipe.title,
            publisher:recipe.publisher,
            sourceURL: recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTimes : recipe.cooking_time,
            ingredients:recipe.ingredients,
            ...(recipe.key && {key:recipe.key}),
        };
}
export const loadingRecipe = async function(id){
    try{
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        // console.log(res, data);
        state.recipe=createRecipeObject(data);
        if(state.bookMarks.some(b => b.id === id))
            state.recipe.bookmarked= true
        else state.recipe.bookmarked = false
        console.log(state.recipe);
    }catch(err){
        console.error(`${err}`);
        throw err;
    }
  
}
export const loadSearchResult = async function(query){
    try{
        state.search.query =query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);
        state.search.results =data.data.recipes.map(rec => {
            return {
                id:rec.id,
                title:rec.title,
                publisher:rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key:rec.key}),
            }
        });
        state.search.page=1;
    }catch(err){
        console.error(err);
        throw err;
    }
}
export const getSearchResultsPage = function(page = state.search.page){
    state.search.page =page;
    const start =(page-1)*state.search.resultsPerPage//0 ;
    const end = page*state.search.resultsPerPage//9;
    return state.search.results.slice(start,end);
}
export const updateServings = function(newServing){
    state.recipe.ingredients.forEach(ing =>{
         ing.quantity =(ing.quantity *newServing) /state.recipe.servings;
    });
    state.recipe.servings=newServing;
}
const persistBookmark = function(){
    localStorage.setItem('bookmarks',JSON.stringify(state.bookMarks));
}
export const addBookmark= function(recipe){
    state.bookMarks.push(recipe);
    //
    
    if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmark();
}

export const deleteBookMark = function(id){
    const index = state.bookMarks.findIndex(el => el.id === id);
    state.bookMarks.splice(index , 1);
    if(id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmark();
}

const init = function(){
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookMarks = JSON.parse(storage);
}
init();
const clearBookmarks = function(){
    localStorage.clear('bookmarks');
}
// clearBookmarks();
export const uploadRecipe = async function(newRecipe){
    try{
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient')&& entry[1]!=='')
        .map(ing =>{
            const ingArr =ing[1].split(',').map(el => el.trim());
            if(ingArr.length !== 3) throw new Error('Wrong ingredient format ')
            const [quantity,unit, description] = ingArr;
            
            return {quantity:quantity? +quantity:null, unit, description};
        });
        const recipe ={
            title:newRecipe.title,
            source_url:newRecipe.sourceUrl,
            image_url:newRecipe.image,
            publisher:newRecipe.publisher,
            cooking_time : +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        } 
        // console.log(recipe);
        const data = await AJAX(`${API_URL}?key=${KEY}`,recipe);
        state.recipe= createRecipeObject(data);
        addBookmark(state.recipe);

    }catch(err){
        throw err;
    }
   
}