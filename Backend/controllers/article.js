'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');

var Article = require('../models/article');

var controller = {

    datosCurso: (req, res) => {
        return res.status(200).send({
            curso: 'Frameworks js',
            autor: 'Diego ramirez',
            hola
        })
    },

    test: (req, res) => {
        return res.status(200).send({
            message:'soy la accion test de mi controlador de articulos'
        });
    },

    save: (req , res) => {
        //Recoger parametros por post
        var params = req.body;
        
        //Validar datos (validator)
        try {
             var validate_title = !validator.isEmpty(params.title);
             var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'faltan datos por enviar !!'
            });
        }

        if(validate_title && validate_content){
            
            //Crear el Objeto a guardar
            var article = new Article();

            // Asignar Valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;
       
            //Guardar el articulo
            article.save((err , articleStored) =>{
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error' ,
                        message: 'El articulo no se ha guardado!!'
                    });
                }
            
                //devolver una Respuesta
                return res.status(200).send({
                    status:'seccess',
                    article:articleStored
                });
        });
        }else {
            return res.status(200).send({
                status: 'error',
                message:'los datos no son validos !!'
            });
        }
    },

    getArticles: (req,res) => {
        
        var query = Article.find({});

        var last = req.params.last;
        if(last || last != undefined){
            query.limit(5);
        }
        
        //Find
        query.sort('-_id').exec((err,articles) => {

            if(err){
                return res.status(500).send({
                    status:'error',
                    message:'error al devolver los articulos!!!'
                });
            }

            if (!articles){
                return res.status(404).send({
                    status:'error',
                    message:'No hay articulos para mostrar !!!'
                });
            }

            return res.status(200).send({
                status: 'succes',
                articles

        });

        });
    },

    getArticle: (req, res) => {

        //Recoger el id de la url
        var articleId = req.params.id;

        //Comprobar que existe
        if(!articleId || articleId == null){
            return res.status(404).send({
                status:'error',
                message:'No hay articulos para mostrar !!'
            });
        }

        //Buscar el Articulo
        Article.findById(articleId, (err , article) => {

            if(err || !article){
                return res.status(404).send({
                    status:'error',
                    message:'no existe el articulo'
                });
            }

            //Devolverlo en json
            return res.status(200).send({
                status:'success',
                article
            });
        });

    },

    update: (req, res) => {
        //Recoger el id del articulo por la url
        var articleId = req.params.id;

        //Recoger los datos que llegan por put
        var params = req.body;

        //Validar datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err){
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar !!'
            });
        }

        if(validate_title && validate_content){
            Article.findOneAndUpdate({_id: articleId}, params, {new:true}, (err, articleUpdated) => {
                if(err){
                    return res.status(500).send({
                        status:'error',
                        message:'Error al actualizar !!'
                    });
                }

                if(!articleUpdated){
                    return res.status(404).send({
                        status:'error',
                        message:'no existe el articulo !!'
                    });
                }

                return res.status(200).send({
                    status:'success',
                    article: articleUpdated
                });
            });
        }else{
            return res.status(200).send({
                status:'error',
                message:'La validacion no es correcta !!'
            });
        }
    },

    delete: (req , res) => {
        //Recoger el id de la url
        var articleId = req.params.id;

        //find and Delete
        Article.findOneAndDelete({_id:articleId}, (err, articleRemoved) => {
            if(err){
                return res.status(200).send({
                    status:'error',
                    message:'Error al borrar !!'
                });
            }

            if(!articleRemoved){
                return res.status(404).send({
                    status:'error',
                    message:'No se ha borrado el articulo, posiblemente no exista !!'
                });
            }

            return res.status(200).send({
                status:'success',
                article: articleRemoved
            });
        });
    },

    upload: (req, res) => {
       // Configurar el modulo connect multiparty router/articles.js(hecho)

       //Recoger el fichero de la peticion
        var file_name = ' Imagen no subida...';

        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
             });
        }
       //conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');
        // en windows var file_split = file_path.split('\\');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extencion del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

       // Comprobar la existencia, solo imagenes , si es valido borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
           
            //borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extension de la imagen no es valida'
                 });
            });
        }else{
            // si todo es valido, sacando id de la url
            var articleId = req.params.id;

            //Buscar el articulo , asignarle el nombre de la imagen y actualizarlo
            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new:true}, (err, articleUpdated) => {

             if(err || !articleUpdated){
                return res.status(200).send({
                    status: 'error',
                    message: 'error al guardar la imagen de articulo'
                });
             }
             
                return res.status(200).send({
                    status: 'success',
                    article: articleUpdated
            });       
         });
        }
    }, // end upload File

    getImage: (req , res) => {
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) => {
            if(exists){
               return res.sendFile(path.resolve(path_file));
            }else{
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });
            }
        });
    },

    search: (req, res ) => {
        // Sacar el string  a buscar
        var searchString =req.params.search;

        // Find or
        Article.find({ "$or":[
            { "title": { "$regex": searchString, "$options": "i"}},
            { "content": { "$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err,articles) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'error en la peticion'
                });

            }
            if (!articles || articles.lenght <= 0){
                return res.status(404).send({
                    status: 'error',
                    message: 'no hay articulos que coincidan con tu busqueda'
                });
            }
            return res.status(200).send({
                status: 'success',
                articles
            });

        });

        
    }

}; //end Controller

module.exports = controller;