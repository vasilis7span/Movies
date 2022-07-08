/********************
 * HELPER FUNCTIONS *
 ********************/
function buildMovieTable(movieList, propsList) {
  const tableElem = document.createElement("table");
  tableElem.border = 1;

  // create headers
  const headersElem = document.createElement("tr");
  for (const prop of propsList) {
    const headerElem = document.createElement("th");
    headerElem.appendChild(document.createTextNode(prop));
    headersElem.appendChild(headerElem);
  }
  tableElem.appendChild(headersElem);

  // create rows (i.e., movie info)
  for (let i = 0; i < movieList.length; i++) {
    const movieInfo = movieList[i];
    const valuesElem = document.createElement("tr");
    for (const prop of propsList) {
      const valueElem = document.createElement("td");
      let valueText = movieInfo[prop].toString();
      // some props need a little bit of preprocessing
      if (prop == "genres") {
        valueText = valueText.replaceAll("|", ", ");
      }
      else if (prop == "timestamp") {
        valueText = new Date(valueText * 1000).toLocaleString();
      }
      valueElem.appendChild(document.createTextNode(valueText));
      valuesElem.appendChild(valueElem);
    }
    tableElem.appendChild(valuesElem);
  }

  return tableElem;
}

function buildAndDisplayTable(movieList, propsList) {
  // case 1: the response contained at least one element
  if (movieList.length > 0) {
    const tableElem = buildMovieTable(movieList, propsList);
    // display table in HTML
    const queryResults = document.getElementById("queryResults");
    if (queryResults.childNodes.length > 0) {
      // resets the table if it exists (from a previous query)
      // so that they don't stack
      queryResults.removeChild(queryResults.childNodes[0]);
    }
    queryResults.appendChild(tableElem);
  }
  // the response contained no elements
  else {
    document.getElementById("queryResults").innerHTML = `<h3> No movie found </h3>`;
   
  }
}
