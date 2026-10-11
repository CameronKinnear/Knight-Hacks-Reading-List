# Marvel Movie Chronology

This project helps people explore Marvel movies in chronological story order while preparing for *Avengers: Doomsday*. It is both a hackathon project and a learning vehicle for full-stack JavaScript development.

## Language

**Movie**:
A Marvel film represented in the application, including the information needed to place it in the story chronology.
_Avoid_: Entry, item

**Chronological order**:
The sequence of Movies by when their events occur in the Marvel story, rather than by theatrical release date.
_Avoid_: Release order, timeline order

## Personal planning

**Watchlist**:
A user's private collection of Movies they intend to watch or are tracking as part of their preparation.
_Avoid_: Movie list, favorites

**Viewing progress**:
A user's personal state for a Movie in their Watchlist, such as not started, in progress, or watched.
_Avoid_: Movie status, completion

**User**:
A person with a registered account whose personal Watchlist and Viewing progress are persisted by the application.
_Avoid_: Visitor, profile

**Watchlist entry**:
The private association between one User and one Movie, including that user's Viewing progress and optional personal note.
_Avoid_: Movie record, watch item

**Catalog**:
The shared, curator-maintained collection of Movies available for everyone to browse. It is not edited by ordinary Users.
_Avoid_: Watchlist, library

**Marvel Studios theatrical film**:
A film released theatrically by Marvel Studios. These films are the complete scope of the Catalog's first version.
_Avoid_: Marvel content, MCU media
