//Список иконок
const ICON_SRC = [
  "primogem.svg",
  "stellar-jade.svg",
  "polychrome.svg",
  "oroberyl.svg",
];

//Параметры расположения иконок
const BG = "#C4D9A3"; //цвет фона
const OPACITY = 0.35; //прозраность иконки
const PER_ICON = 18; //количество иконок каждого вида
const MIN_GAP = 25; //минимальное расстояние между
const SAME_DIST = 280; //расстояние между иконками одного вида
const MARGIN = 50; //отступ от края
const SCALE_RANGE = [0.65, 1.1]; //масштаб иконок
const MAX_ROT = 6; // максимальный градус пворота иконки
//const EXPORT_W = 3840; //ширина PNG