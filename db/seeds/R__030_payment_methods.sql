-- credit card payment methods
INSERT INTO
  payment_methods (member_id, type)
SELECT
  m.id,
  'credit_card'
FROM
  (
    VALUES
      ('admin', '4000000000000000', '11/29', '123'),
      (
        'jonas.weber@web.de',
        '4000000000002222',
        '03/28',
        '237'
      ),
      (
        'lukas.fischer@outlook.de',
        '4000000000004444',
        '09/29',
        '089'
      ),
      (
        'sophie.mueller@web.de',
        '4000000000005555',
        '10/27',
        '655'
      ),
      (
        'hannah.wolf@mail.de',
        '4000000000007777',
        '01/28',
        '318'
      ),
      (
        'max.neumann@t-online.de',
        '4000000000008888',
        '08/29',
        '904'
      ),
      (
        'paul.bauer@outlook.de',
        '4000000000010000',
        '06/30',
        '450'
      ),
      (
        'juliane.schwarz@web.de',
        '4000000000011111',
        '04/29',
        '531'
      ),
      (
        'emily.kaiser@t-online.de',
        '4000000000013333',
        '02/28',
        '619'
      ),
      (
        'nico.herrmann@web.de',
        '4000000000014444',
        '11/27',
        '387'
      ),
      (
        'lara.schulz@mail.de',
        '4000000000015555',
        '03/29',
        '702'
      ),
      (
        'sarah.maier@web.de',
        '4000000000017777',
        '12/29',
        '951'
      ),
      (
        'mila.lehmann@t-online.de',
        '4000000000019999',
        '05/30',
        '147'
      ),
      (
        'tom.reuter@web.de',
        '4000000000020000',
        '01/29',
        '863'
      ),
      (
        'nora.peters@mail.de',
        '4000000000021111',
        '10/28',
        '295'
      ),
      (
        'clara.braun@gmx.de',
        '4000000000023333',
        '04/28',
        '638'
      ),
      (
        'leon.zimmermann@web.de',
        '4000000000024444',
        '03/30',
        '412'
      )
  ) AS v (email, card_number, card_expiry, card_cvc)
  JOIN members m ON m.email = v.email;

-- iban payment methods
INSERT INTO
  payment_methods (member_id, type)
SELECT
  m.id,
  'iban'
FROM
  (
    VALUES
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
      ('jan.koenig@outlook.de', 'DE21500105170123456789')
  ) AS v (email, iban)
  JOIN members m ON m.email = v.email;
