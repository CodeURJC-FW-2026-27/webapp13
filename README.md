
# Bestiario de Monster Hunter World

## **Integrantes del equipo de desarrollo**
|Nombre|Correo de la universidad|Usuario de Github|
|--------|----------------|--------------|
| Nicolas Gutu Gutu | n.gutu.2025@alumnos.urjc.es | nicolengo1|
|João Paulo Ortega | jp.ortega.2025@alumnos.urjc.es | OrtegaJp|
| Carlos Abraham Velasco Carmona | ca.velasco.2025@alumnos.urjc.es | veeelasco |

## **Funcionalidad**
### **Entidades**
| Principal/Zona de caza | Valores | Explicacion |
|------------------------|---------|-------------|
| Nombre | Ancient Forest, Coral Highlands, Wildspire Waste, Rotten Vale, Elder's Recess, Hoarfrost Reach, Origin Isle | Todas las posibles zonas del juego |
| Dificultad | ⭐-⭐⭐⭐⭐⭐ | se evaluara usando estrellitas, de 1 a 5 estrellas, 1 siendo el mas facil y 5 el mas dificil. un sistema simple de dificultad dependiendo de los monstruos que habitan la zona y de como es la zona en si |
| Categorias | LR - low rank, HR - high rank, MR - master rank | categorias de dificultad disponibles para cada zona, la dificultad original del juego |
| Imagen | url de la imagen | una imagen general de la zona |
| Descripcion | un string (en ingles) |una descripcion simple de la zona |
| Entorno | zona con volcanes, zona con pantano, zona montañosa, zona con mucho desnivel, zona muy apretada, etc (en ingles) | alguna informacion importante  que podria ayudar al jugador |
| Temperatura | Frostbite , Temperate climate, Scorching | equivalente a necesitar pocion de calor, no pocion, pocion de frio |
##
| Secundaria/Criaturas Monstruosas | Valores | Explicacion |
|------------------------|---------|-------------|
| Nombre | un string | el nombre de cada bestia |
| Dificultad | ⭐-⭐⭐⭐⭐⭐ | se evaluara usando estrellitas, de 1 a 5 estrellas, 1 siendo el mas facil y 5 el mas dificil. dificultad general de el monstruo |
| Categorias | LR - low rank, HR - high rank, MR - master rank | categorias de dificultad disponibles para cada monstruo, la dificultad original del juego |
| Imagen | url de la imagen | imagen del monstruo |
| Especie de criatura | Bird Wyvern, Brute Wyverns, Fanged Beasts, Fanged, Wyverns, Flying Wyverns, Piscine Wyverns, Elder Dragons | especie de la bestia |
| Elementos | Fire, Water, Thunder, Ice, Dragon | un string con uno/multiples valores, es el "tipo" de monstruo |
| Efectos inflingidos | Poison, Stun, Paralysis, Sleep, Blastblight | un string con uno/multiples valores |
| Debilidades | Fire, Water, Thunder, Ice, Dragon | un string con uno/multiples valores |
| Resistencias | Fire, Water, Thunder, Ice, Dragon | un string con uno/multiples valores |
| Habitat | Cualquier habitat, solo 1 | un string con un valor/multiples  |
| Tamaño | Float, min 482.63cm  ~ Max 257 000.0 cm | cada criatura puede tomar un valor entre un min y max especificado |
| Informacion en forma de texto | un string | informacion adicional sobre el monstruo y algun detalle |
 
    *- Cada monstruo tendra una cajita con 3 checkboxes para marcar: 1- si ha sido derrotado, 2- si se ha derrotado a la criatura en su tamaño mas pequeño, 3- si se ha derrotado a la criatura en su tamaño mas grande*

### **Imagenes**
 Zona de caza -  ejemplo
![Zona Bosque Primigenio](https://static.wikia.nocookie.net/monsterhunterespanol/images/9/94/MHW-Bosque_Primigenio.jpg/revision/latest?cb=20171117132631&path-prefix=es) 
 
 Criaturas  -  ejemplo
![Criatura ](https://static.wikia.nocookie.net/monsterhunterespanol/images/3/34/MHW-Render_Rathalos_001.png/revision/latest?cb=20171118104211&path-prefix=es)

### **Buscador, Filtrado  o categorización**
- Buscador: El usuario podra buscar una zona de caza en especifico por su nombre
- Filtrado o Categorización: El usuario podra filtrar las ZONAS por dificultad o algo, luego podemos hacer para los dragones
