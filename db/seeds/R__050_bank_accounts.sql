INSERT INTO
  bank_accounts (payment_method_id, iban)
SELECT
  pm.id,
  v.iban
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
  JOIN members m ON m.email = v.email
  JOIN payment_methods pm ON pm.member_id = m.id
  AND pm.type = 'iban';
