INSERT INTO
  bank_accounts (member_id, iban)
SELECT
  m.id,
  v.iban
FROM
  (
    VALUES
      -- Original bank accounts
      ('lena.hartmann@gmx.de', 'DE44500105175407324931'),
      (
        'maria.schmidt@t-online.de',
        'DE89370400440532013000'
      ),
      ('tim.becker@gmail.com', 'DE75512108001245126199'),
      ('lea.koch@gmx.de', 'DE24500105170204384912'),
      ('ben.vogel@gmx.de', 'DE12500105170648489890'),
      (
        'daniel.werner@outlook.de',
        'DE50500105177312345678'
      ),
      ('felix.hoffmann@gmx.de', 'DE12500105170012345679'),
      ('jan.koenig@outlook.de', 'DE21500105170123456789'),
      -- New bank accounts for additional members
      (
        'anna.krueger@gmail.com',
        'DE89370400440532013111'
      ),
      ('david.berg@outlook.de', 'DE44500105175407324222'),
      ('laura.frank@web.de', 'DE75512108001245126333'),
      (
        'philip.hahn@outlook.de',
        'DE24500105170204384444'
      ),
      ('emma.gross@mail.de', 'DE12500105170648489555'),
      (
        'moritz.schreiber@gmx.de',
        'DE50500105177312345666'
      ),
      (
        'vanessa.meyer@t-online.de',
        'DE89370400440532013777'
      ),
      ('thomas.becker@web.de', 'DE44500105175407324888'),
      (
        'sabine.weber@t-online.de',
        'DE75512108001245126999'
      ),
      ('rene.koch@web.de', 'DE24500105170204385000'),
      (
        'monika.schulz@t-online.de',
        'DE12500105170648490111'
      ),
      ('jens.lang@web.de', 'DE50500105177312346222'),
      (
        'claudia.krause@t-online.de',
        'DE89370400440532014333'
      ),
      ('uwe.martin@web.de', 'DE44500105175407325444'),
      (
        'silke.moeller@t-online.de',
        'DE75512108001245127555'
      ),
      ('dirk.friedrich@web.de', 'DE24500105170204385666'),
      (
        'christian.schulze@web.de',
        'DE12500105170648490777'
      ),
      ('robin.kramer@web.de', 'DE50500105177312346888'),
      (
        'sabrina.vogel@t-online.de',
        'DE89370400440532014999'
      ),
      ('dennis.horn@web.de', 'DE44500105175407326000'),
      (
        'nicole.keller@t-online.de',
        'DE75512108001245128111'
      ),
      ('matthias.fuchs@web.de', 'DE24500105170204386222'),
      (
        'marie.dietrich@t-online.de',
        'DE12500105170648491333'
      ),
      (
        'sandra.wolf@t-online.de',
        'DE50500105177312347444'
      ),
      (
        'doris.engel@t-online.de',
        'DE89370400440532015555'
      ),
      (
        'horst.schroeder@web.de',
        'DE44500105175407326666'
      ),
      ('ingrid.wirth@gmx.de', 'DE12500105170648491777'),
      (
        'torsten.haas@outlook.de',
        'DE50500105177312347888'
      ),
      ('katja.weber@gmx.de', 'DE89370400440532015999'),
      ('ralph.pfeiffer@web.de', 'DE44500105175407327111'),
      ('joerg.link@outlook.de', 'DE75512108001245128222'),
      (
        'elke.sauer@t-online.de',
        'DE24500105170204386333'
      ),
      ('stefan.ritter@web.de', 'DE12500105170648491444'),
      (
        'klaus.albrecht@outlook.de',
        'DE50500105177312347555'
      ),
      (
        'sonja.adler@t-online.de',
        'DE89370400440532016666'
      ),
      ('monika.stark@gmx.de', 'DE44500105175407327777'),
      (
        'rainer.kuhn@outlook.de',
        'DE75512108001245128888'
      ),
      (
        'christa.bock@t-online.de',
        'DE24500105170204386999'
      ),
      ('wolf.pfeifer@web.de', 'DE12500105170648492111'),
      (
        'elfriede.herbst@t-online.de',
        'DE50500105177312348222'
      ),
      (
        'manfred.stein@outlook.de',
        'DE89370400440532017333'
      ),
      (
        'siegfried.strauss@outlook.de',
        'DE44500105175407328444'
      ),
      ('ernst.vogel@web.de', 'DE75512108001245129555'),
      ('peter.frey@outlook.de', 'DE24500105170204387666'),
      (
        'ursula.voss@t-online.de',
        'DE12500105170648492777'
      ),
      ('gertrud.wenzel@gmx.de', 'DE50500105177312348888'),
      ('karl.dorn@mail.de', 'DE89370400440532017999'),
      ('gudrun.siebert@gmx.de', 'DE44500105175407329111'),
      ('lore.wetzel@web.de', 'DE75512108001245130222'),
      (
        'wilfried.jansen@outlook.de',
        'DE24500105170204388333'
      ),
      ('martha.seifert@gmx.de', 'DE12500105170648493444'),
      (
        'friedrich.kunze@mail.de',
        'DE50500105177312349555'
      ),
      ('anton.geiger@mail.de', 'DE89370400440532018666')
  ) AS v (email, iban)
  JOIN members m ON m.email = v.email;
