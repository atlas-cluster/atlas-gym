INSERT INTO
  trainers (member_id)
VALUES
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'admin'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'maria.schmidt@t-online.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'jonas.weber@web.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sophie.mueller@web.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'max.neumann@t-online.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'sarah.maier@web.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'felix.hoffmann@gmx.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'daniel.werner@outlook.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'verena.otto@web.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'guenter.simon@t-online.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'lars.nowak@mail.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'diana.reinhardt@gmx.de'
    )
  ),
  (
    (
      SELECT
        id
      FROM
        members
      WHERE
        email = 'axel.berger@t-online.de'
    )
  );
