const notFound =(req,res)=>{
    res.status(404).send(`<h1>ROUTE NOT FOUND </h1>`);
}

module.exports = {notFound};