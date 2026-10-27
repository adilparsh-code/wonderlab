import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UniverseGamePlayer } from "@/components/universe-game-player";
import { GamePlayer } from "@/components/game-player";
import { games } from "@/lib/catalog";

type GamePageProps = {
  params: Promise<{ game: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ game: game.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: gameId } = await params;
  const game = games.find((item) => item.id === gameId);
  return game
    ? { title: game.title, description: game.description }
    : { title: "Game not found" };
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: gameId } = await params;
  const game = games.find((item) => item.id === gameId);
  if (!game) notFound();

  return (
    <div className="container">
      {game.engine ? <UniverseGamePlayer game={game} /> : <GamePlayer game={game} />}
    </div>
  );
}
