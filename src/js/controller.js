import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import { async } from 'regenerator-runtime';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './views/addRecipeView.js';

//const recipeContainer = document.querySelector('.recipe');
//from parcel
// if (module.hot) {
//   module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////
//using fetch function will return a promise, since we are in async function, then we can await that promise(stopping code excecution at await point)
//async function runs inly in background

const controlRecipes = async function () {
  //render recipe after load
  try {
    //render search results
    //resultsView.renderSpinner();
    const id = window.location.hash.slice(1);
    // console.log(id);
    //guard clause
    if (!id) return;
    //render spinner before loading recepis
    recipeView.renderSpinner();

    //update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //load recipe
    await model.loadRecipe(id);

    //rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //from searchview.js
    const query = searchView.getQuery();
    if (!query) return;

    //load search results
    await model.loadSearchResults(query);

    //render results
    //console.log(model.state.search.results);
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //render initialpagination buttons
    paginationView.render(model.state.search);
    ////
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //////////render will overide the markup, since we have this._clear() method.
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render New pagination buttons
  paginationView.render(model.state.search);
  //console.log(goToPage);
};

const controlServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);
  //update recipe view
  //Update method will basically update text and attributes in the DOM, without having to re-render the entire view.
  recipeView.update(model.state.recipe);
};

//bookmark
const controlAddBookmark = function () {
  //add bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  //remove bookmark
  else model.deleteBookmark(model.state.recipe.id);

  //update recipe view
  recipeView.update(model.state.recipe);

  //render bookmark
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};
////
const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

//window.addEventListener('hashchange', controlRecipes);
//window.addEventListener('load', controlRecipes);
