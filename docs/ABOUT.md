## Odio el odio: Clasificación de tweets con discurso de odio

Como parte del proyecto IDORS (Identificación de Discurso de Odio en Redes Sociales), llevado a cabo en el marco del curso Proyecto de Grado de la carrera de Ingeniería en Computación de la Facultad de Ingeniería - UdelaR por Lucas Kunc y Manuel Saravia, surge la aplicación **Odio el odio**, adaptada de la aplicación de clasificación de tweets humorísticos [Clasifica humor](https://www.clasificahumor.com/). La misma tiene como finalidad la generación de un corpus anotado de tweets, donde las etiquetas para cada tweet se corresponden con los criterios presentados a continuación:

- Contiene discurso de odio (a partir de este punto DDO). En caso de que lo contenga, corresponde a alguno de los siguientes tipos:
  - Racismo: DDO donde se utiliza el color de la piel o el origen étnico de la persona.
  - Misoginia: DDO donde se utiliza la identificación de la persona con el género femenino.
  - Homofobia: DDO donde se utiliza la orientación sexual de la persona.
  - Ideológico: DDO donde se utiliza la ideología (por ejemplo, la posición política) de la persona.
  - Otro: en caso de que no se vea ninguno de los tipos anteriores, se etiqueta el tweet con un tipo distinto.
- Contiene lenguaje ofensivo, como insultos o lenguaje soez en general.

En particular nos parece interesante el caso del DDO ideológico, ya que ha cobrado un protagonismo grande en Twitter hoy en día y notamos que no es muy tenido en cuenta en la literatura que hemos explorado hasta el momento.

Los tweets que se muestran en pantalla se obtuvieron con el script [twitterscraper](https://github.com/taspinar/twitterscraper), desarrollado por el Físico y Data Scientist [Ahmet Taspinar](http://ataspinar.com/). Dicho script interactúa con la [API standard](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html) de Twitter para obtener los tweets dado un término de búsqueda. Para construir los términos, se utilizaron los operadores OR (el cual busca tweets donde ocurre el subtérmino de la izquierda o el de la derecha o ambos) y AND (el cual busca tweets donde ocurren tanto el subtérmino de la izquierda como el de la derecha), combinando palabras relacionadas con los tipos de odio mencionados anteriormente, las cuales se colocaron en las siguientes listas:

- *hateful_words*: palabras (o frases) que seguramente impliquen DDO.
- *aggresive_words*: palabras (o frases) agresivas que no necesariamente implican DDO.
- *dependent_words*: palabras (o frases) representativas del grupo víctima que generalmente no son usadas en un contexto de DDO.
  
Además se mantuvo una lista de insultos de uso general. 

A partir de estas listas de palabras, se generaron los términos con las siguientes combinaciones:
	
- Utilizando las palabras de la lista *hateful_words* individualmente.
- Combinando palabras de la lista *dependent_words* con insultos.
- Combinando palabras de la lista *aggresive_words* con insultos.
- Combinando palabras de la lista *aggresive_words* con palabras de la lista *dependent_words*.
- Combinando palabras de la lista *aggresive_words* consigo mismas.

Los tweets fueron recolectados durante un período de un año, desde el 14 de Julio de 2018 hasta el 14 de Julio de 2019.

El corpus construido será destinado a la generación de un modelo que logre, en un principio, identificar si un Tweet aleatorio en español profesa DDO. 
