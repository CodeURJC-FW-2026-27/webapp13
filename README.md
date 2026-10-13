

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
| Nombre | Ancient Forest, Coral Highlands, Wildspire Waste, Rotten Vale, Elder's Recess, Hoarfrost Reach, Origin Isle, Confluence of Fates, Caverns of El Dorado, Costle Schrade (string) | Todas las posibles zonas del juego |
| Dificultad | ⭐-⭐⭐⭐⭐⭐ (se procesara el valor de la base de datos y se transformara a las estrellitas correspondiendes, el valor base son tres bits, de 0 a 5 en binario) | se evaluara usando estrellitas, de 1 a 5 estrellas, 1 siendo el mas facil y 5 el mas dificil. un sistema simple de dificultad dependiendo de los monstruos que habitan la zona y de como es la zona en si |
| Categorias | LR - low rank, HR - high rank, MR - master rank (se procesara en la base de datos y devolvera un string, el dato base son dos bits, de 0 a 3 en binario)| categorias de dificultad disponibles para cada zona, puede tener multiples opciones, la dificultad original del juego |
| Imagen | url de la imagen (string) | una imagen general de la zona |
| Descripcion | un string |una descripcion simple de la zona |
| Entorno | zona con volcanes, zona con pantano, zona montañosa, zona rocosa, zona con mucho desnivel, zona muy apretada, etc | alguna informacion importante  que podria ayudar al jugador |
| Temperatura | Frostbite , Temperate climate, Scorching (un string, solo una opcion, igual, se procesara en la base de datos y se devolvera el string, el dato base son 2 bits, de 0 a 2 en binario) | equivalente a necesitar pocion de calor, no pocion, pocion de frio |
##
| Secundaria/Criaturas Monstruosas | Valores | Explicacion |
|------------------------|---------|-------------|
| Nombre | un string | el nombre de cada bestia |
| Dificultad | ⭐-⭐⭐⭐⭐⭐ (igual, se procesa y se devuelve, 3 bits de 0 a 4 en binario) | se evaluara usando estrellitas, de 1 a 5 estrellas, 1 siendo el mas facil y 5 el mas dificil. dificultad general de el monstruo. Una unica opcion |
| Categorias | LR - low rank, HR - high rank, MR - master rank (igual, se procesa y se devuelve, 2 bits, de 0 a 2) | categorias de dificultad disponibles para cada monstruo, la dificultad original del juego, puede ser multiples opciones |
| Imagen | url de la imagen | imagen del monstruo |
| Especie de criatura | Bird Wyvern, Brute Wyverns, Fanged Beasts, Fanged, Wyverns, Flying Wyverns, Piscine Wyverns, Elder Dragons (se procesa y se devuelve, 3 bits, de 0 a 7| especie de la bestia, solo puede ser una unica especie |
| Elementos | Fire, Water, Thunder, Ice, Dragon, None (procesado, 3 bits, de 0 a 5) | un string con uno/multiples valores, es el "tipo" de monstruo |
| Efectos inflingidos | Poison, Stun, Paralysis, Sleep, Blastblight, Bleeding, Waterblight, None (procesado, 3 bits, de 0 a 7)| un string con uno/multiples valores |
| Debilidades | Fire, Water, Thunder, Ice, Dragon, None (procesado, 3 bits, de 0 a 5) | un string con uno/multiples valores |
| Resistencias | Fire, Water, Thunder, Ice, Dragon, None (procesado, 3 bits, de 0 a 5) | un string con uno/multiples valores |
| Habitat | Cualquier habitat, solo 1 | un string con un valor/multiples  |
| Tamaño | Float, min 482.63cm  ~ Max 257 000.0 cm | cada criatura puede tomar un valor entre un min y max especificado |
| Informacion en forma de texto | un string | informacion adicional sobre el monstruo y algun detalle |
 
### **Buscador, Filtrado  o categorización**
- Buscador: El usuario podra buscar una zona de caza en especifico por su nombre
- Filtrado o Categorización: El usuario podra filtrar las zonas por dificultad o rank (LR, HR, MR)

### **Imagenes**
 Zona de caza -  ejemplo
![Zona Bosque Primigenio](https://static.wikia.nocookie.net/monsterhunterespanol/images/9/94/MHW-Bosque_Primigenio.jpg/revision/latest?cb=20171117132631&path-prefix=es) 
 
 Criaturas  -  ejemplo
![Criatura ](https://static.wikia.nocookie.net/monsterhunterespanol/images/3/34/MHW-Render_Rathalos_001.png/revision/latest?cb=20171118104211&path-prefix=es)


 ##### **Opcional**
    *- Cada monstruo tendra una cajita con 3 checkboxes para marcar: 1- si ha sido derrotado, 2- si se ha derrotado a la criatura en su tamaño mas pequeño, 3- si se ha derrotado a la criatura en su tamaño mas grande*