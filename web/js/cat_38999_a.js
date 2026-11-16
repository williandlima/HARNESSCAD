/* HarnessCAD - MIL-DTL-38999 Série III: arranjos de inserto IAW MIL-STD-1560 (parte 1)
   Fontes: Glenair "MIL-DTL-38999 Series I-IV" (págs. D-2..D-4, B-2/B-3) e Amphenol "38999 catalog" (págs. 7-30, 42-43).
   ids: identificação dos contatos ('N13' = 1..13); z: tamanho por contato (d=22D 2=20 6=16 1=12; 'x*' = todos x);
   p: posição de cada contato na face do inserto de PINOS, vista frontal, chaveta mestra em cima: 4 caracteres base 36
   por contato (x, y em -1..1 do raio da face; y para baixo); src: de onde veio; c: só contagem (sem desenho no catálogo). */
(function (G) {
  'use strict';
  var HX = G.HX; HX.D38999_ARR = (HX.D38999_ARR || []).concat([
    {i:'9-35', s3:'A35', ids:'N6', z:'d*', p:'q4avsyk4llrz7ojy9obadzhs', src:'AL'},
    {i:'9-98', s3:'A98', ids:'A B C', z:'2*', p:'lpcjl8sob2cs', src:'AL'},
    {i:'11-2', s3:'B2', c:{'16':2}},
    {i:'11-4', s3:'B4', c:{'20':4}},
    {i:'11-5', s3:'B5', ids:'A B C D E', z:'2*', p:'pjbmsikijwoc73kb8yd7', src:'AL'},
    {i:'11-35', s3:'B35', ids:'N13', z:'d*', p:'ja87orddrlehrinnm7sbfrspbbo87pjqahdge69hgsddmej5dzhs', src:'AL'},
    {i:'11-98', s3:'B98', c:{'20':6}},
    {i:'11-99', s3:'B99', c:{'20':7}},
    {i:'13-4', s3:'C4', ids:'A B C D', z:'6*', p:'hzferlnhhzvl8mnh', src:'G'},
    {i:'13-8', s3:'C8', ids:'A B C D E F G H', z:'2*', p:'n778thi1r4pbi2tl96pb6di0cy7si1ed', src:'G'},
    {i:'13-35', s3:'C35', c:{'22D':22}},
    {i:'13-98', s3:'C98', ids:'A B C D E F G H J K', z:'2*', p:'i36cqo9buygas1qhi2tn8bqf57ga9k9bmdj7dujf', src:'G'},
    {i:'15-5', s3:'D5', ids:'A B C D E', z:'6*', p:'i0chrfgvn3q7cxq68kgv', src:'G'},
    {i:'15-15', s3:'D15', ids:'A B C D E F G H J K L M N P R', z:'222222222222262', p:'nf5ysyajv9hdtuo2outhi0veb6th66o94sh372aicl5qi0aknzfri0mbc1fr', src:'G'},
    {i:'15-18', s3:'D18', ids:'A B C D E F G H J K L M N P R S T U', z:'2*', p:'l95yslbzw4i5slobp2uci1ucazu57goa3xi57gbze55yeic0ljc7p2i4lko8eho9azhwi1i5', src:'G'},
    {i:'15-19', s3:'D19', ids:'A B C D E F G H J K L M N P R S T U V', z:'2*', p:'i15yp25yslbzw5i5slobp2uci1ucazu57goa3xi57gbzaz5qeic0ljc7p2i4lko8eho9azhwi1i5', src:'G'},
    {i:'15-35', s3:'D35', ids:'N37', z:'d*', p:'kf3uon69te9cvqdowdijvcnastrgp0ujkfw5fkw5azuj76rg4nna3mij49do6l9cbc69fk3ukf8ponbkr6fur6kponovkfrafkrabcov8tkp8tfubcbkfk8pkfe0mvi7kfmffkmfd4i7fke0i0i7', src:'A'},
    {i:'15-97', s3:'D97', ids:'A B C D E F G H J K L M', z:'226222622266', p:'ll5grp8iujjdsfrwllutd9uu6wna5eee8g8iek5gfjdqkmmi', src:'G'},
    {i:'17-6', s3:'E6', ids:'A B C D E F', z:'1*', p:'mv7prui5i1rx89i4d87pi1i5', src:'G'},
    {i:'17-8', s3:'E8', ids:'A B C D E F G H', z:'6*', p:'i16wnuekrvmqmvsld8sl89mrc9eji2jm', src:'G'},
    {i:'17-26', s3:'E26', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b c', z:'2*', p:'i03mnv4vsp8fvndkwajiugp7qgtmkzw2f0w29jtm5jp73pji4cdk7a8fc44veva2l4a2pudspyjmnbori0r3coora1jma5dsi0f3i0kw', src:'A'},
    {i:'17-35', s3:'E35', ids:'N55', z:'d*', p:'4ce84ci64cm47e8c7rc97rg77rk57ro27rs0ah5sb6aab6e8b6i6b6m4b6q1b6tze346el8celc9elg7elk5elo2els0elvyi03li0aai0e8i0i6i0m4i0q1i0tzlw46le8clec9leg7lek5leo2les0levypi5sotaaote8oti6otm4otq1ottzsl8cs8c9s8g7s8k5s8o2s8s0vne8vni6vnm4', src:'A'},
    {i:'17-99', s3:'E99', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z', z:'22222222222222222226226', p:'i23wnv5csh8ivkdjw6jtuep3qftml1vsf3w09ptg5rp93xjs4kdr7h8gc956eza8l5aapudsnulyi1puc9lrabdsi1gp', src:'G'},
    {i:'19-11', s3:'F11', ids:'A B C D E F G H J K L', z:'6*', p:'mg66t3brumkaqarti0uk9zrt5mka74brds66i0dhi0m0', src:'G'},
    {i:'19-28', s3:'F28', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b c d e', z:'2222222222222222222222622226', p:'kl4lpb6lt19svbedvsjeueo4rdsbn2uti2vrd2uz8ssb5rob4dje4ted739nat69fj4ki294mtapq2ehqtjeornwi2q6bdnx9bjea1emdbaki2fx', src:'G'},
    {i:'19-30', s3:'F30', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b c d e f g', z:'222222222222222222222222222622', p:'l43dq65muk9nx4fuxek2ukq7qnu6l4whf3wh9zum5vq536kp36dpa35hc247f339l78fp7c9sdi3pemul3pni6tmezpmapms7xhyalc9en8chtd5l2kwezkw', src:'G'},
    {i:'19-32', s3:'F32', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b c d e f g h j', z:'2*', p:'kn3vpk5stg9bvte2wajbuuoerosmn7vei0wdcsve8bsm55oe3pjb46e26j9baf5sfc3vi08smya9qde7r4jboyo1klqufequb1o18vjb9me7d1a9i0e5lui0i0lue5i0', src:'A'},
    {i:'19-35', s3:'F35', c:{'22D':66}},
    {i:'19-45', s3:'F45', c:{'22D':67}},
    {i:'21-11', s3:'G11', ids:'A B C D E F G H J K L', z:'1*', p:'o25iucbtvslfqws4i2wd97si4ql15wbkbx5ui2cti2nh', src:'G'},
    {i:'21-16', s3:'G16', ids:'A B C D E F G H J K L M N P R S', z:'6*', p:'nh5vt0akvbhdtvo9owthi1vfb8th68o94thd73alcm5xi1c8o0fzlpmbefmbc3fy', src:'G'},
    {i:'21-24', s3:'G24', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a', z:'2*', p:'o443uianwhhwunpbpburhuwpapur56pb36hw56anb743hu63n7aor1hwpbnhksr2fbr2apnh8shwceaohucjlkgyhulme9gy', src:'G'},
    {i:'21-25', s3:'G25', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b', z:'2*', p:'i02tnw3pqo9fwhbjxeh3wmn2sktnlxxbebxb7etn3un22qh33nbj989fc83pkt9fsxgsnypvcdpv8gfbey9fi0f6n1j1i0n2daj1', src:'G'},
    {i:'21-27', s3:'G27', ids:'A B C D E F G H J K L M N P R S T U V W X Y Z a b c d', z:'2*', p:'hz2wng3psb7mvyclx4i2w0nxsotmm0xcefxc7mtm3snx2ti23ncl5l9i9o6qmp9mqdecrmk5nqpqhzrtcjpq8qk59cecdb9mhzeclqj3cwkd', src:'G'}
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
