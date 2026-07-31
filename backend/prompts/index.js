const generalprompt = require("./general");
const storyNovelprompt = require("./storyNovel");
const schemas = require("./outputSchemas");


function getprompt(documentType) {

      let schema = schemas.general;

    switch(documentType) {

          case  "Story / Novel":
            schema = schemas.story;
            return{
                prompt: storyNovelprompt(),
                schema: schema
            };
           

         default:
            return {
               prompt: generalprompt(),
               schema: schema
            };
            
           

    }

}


module.exports = getprompt;