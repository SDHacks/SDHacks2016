$(document).ready(function() {
  var logo = 
  [ '              .;;;;:              ',
    '             ;;;;;;;;.            ',
    '           :;;;;;;;;;;:           ',
    '         :;;;;;;;;;;;;;;:         ',
    '       .;;;;;;;;;;;;;;;;;;:       ',
    '      :;;;;;;;;;;;;;;;;;;;;;.     ',
    '     ;;;;;;;:::::;:::::;;;;;;:    ',
    '    ;;;;;;;`     ,     .;;;;;;    ',
    '   .;;;;;:      :,       ;;;;;:   ',
    '   :;;;;;   ```;;,        ;;;;;   ',
    '   :;;;;;  `:;;;;,  ;:;   .;;;;   ',
    '   :;;;;;    ;:;;,  ;;;;   :;;;   ',
    '   :;;;;;.     ;;;::;;;;   :;;;   ',
    '   :;;;;;;;     ;;;;;;;;   :;;;   ',
    '   :;;;;;;;:;   ,;;;;;;;   :;;;   ',
    '   :;;;;;;;;;.  .;;;;;;   ,;;;;   ',
    '   :;;;;;;      ;,        ;;;;;   ',
    '   :;;;;;      `:,       ;;;;;;   ',
    '   :;;;:``````;:;,````.;:;;;;;;   ',
    '   :;;;;;;;;;;;;;;;;:;:;;;;;;;;   ',
    '   :;;;;; : ;,,; `  ``, `;;;;;;   ',
    '   `;;;;;   ;  :.::  ::  ;;;;;:   ',
    '    ;;;;; ; :``: ,` ``,,.,;;;;    ',
    '     ;;;;:;,,,;,;,;;;,;,,:;;;.    ',
    '      :;;;;;;;;;;;;;;;;;;;;;`     ',
    '       `;;;;;;;;;;;;;;;;;;.       ',
    '         .;;;;;;;;;;;;;;:         ',
    '           :;;;;;;;;;;:           ',
    '             :;;;;;;;`            ',
    '              `:;;:,              '];
  var logoString = logo.join('\n');
  console.log('%cWelcome to SD Hacks 2016!', 'font: "Source Sans Pro","Opens Sans",Helvetica,Roboto,Arial,sans-serif; color: #19A3C5; font-size: 1.5em;');
  console.log('%cThis website is open-sourced on Github at %chttps://github.com/SDHacks/SDHacks2016', 'font: "Source Sans Pro","Opens Sans",Helvetica,Roboto,Arial,sans-serif; font-size: 1em;', 'color: #19A3C5');
  console.log('%c' + logoString, 'font: 20px/10px monospace;');
});