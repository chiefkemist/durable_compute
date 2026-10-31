create table albums (
  id text primary key not null,
  title text not null check (length(trim(title)) > 0),
  artist text not null check (length(trim(artist)) > 0),
  year integer not null check (year > 0)
);

create table tracks (
  id text primary key not null,
  album_id text not null references albums(id) on delete cascade,
  title text not null,
  position integer not null,
  unique (album_id, position)
);
