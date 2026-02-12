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
  );
