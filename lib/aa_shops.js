Promise.all([
fetch('intro.md').then(r=>r.text()),
fetch('aa_shops.json').then(r=>r.json()),
fetch('outro.md').then(r=>r.text())
]).then(files=>{
  const mdContent = document.createDocumentFragment();
  mdContent.append(files[0],'\n');
  
  const data = files[1];
  const categories = Object.fromEntries(data.categories.map(c=>[c.name, c]));
  const grouped={};
  data.shops.forEach(s=>{
    s.categories.forEach(c=>{
      grouped[c] = grouped[c]||[];
      grouped[c].push(s);
    })
  })
  let names = Object.keys(grouped);
  names.sort((g1,g2)=>{
    if(g1.position>0&&g2.position>0){
      return g1.position-g2.position;
    }else if(g1.position>0){
      return -1;
    }else if(g2.position>0){
      return 1;
    }else{
      return g1.name.localeCompare(g2.name);
    }
  });
  for(let g of names){
    let cat = categories[g] || {name:g};
    mdContent.append('\n## ', 
        cat.displayName||cat.name,
        '\n');

    grouped[g].sort((s1,s2)=>
      s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));

    for(let s of grouped[g]){
      //* Akkurat: [Akkurat](https://akkurat-gsv.de/shop) (Shop für erneuerbare Energien)
      console.debug(s);
      mdContent.append('\n * ');
      if(s.pages.length>1){
        mdContent.append(s.displayName||s.name,': ');
      }
      
      mdContent.append(s.pages.map(p=>{
        return '['+(p.caption||s.displayName||s.name)+']('+p.href+')';
      }).join(' / '));
      
      if(s.description){
        mdContent.append(' \u2014 ', s.description);
      }
    }
      mdContent.append('\n');
    
    
  }
  
  mdContent.append(files[2],'\n');
  
  let contentData = document.createElement('div');
  //contentData.dataset.languange = 'markdown'
  const md = window.markdownit();
  const result = md.render(mdContent.textContent);  
  console.log(result);
  contentData.innerHTML=result;
  document.body.append(contentData);
  
});