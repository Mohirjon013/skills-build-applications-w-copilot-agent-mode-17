import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = input as Record<string, unknown>;
  const { userId, teamId, type, minutes } = body;

  if (!userId || !teamId || !type || minutes == null) {
    throw Object.assign(new Error('Missing required fields: userId, teamId, type, minutes'), { status: 400 });
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    throw Object.assign(new Error('Invalid userId format'), { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(teamId as string)) {
    throw Object.assign(new Error('Invalid teamId format'), { status: 400 });
  }

  // Validate references exist
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 422 });
  }
  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 422 });
  }

  const points = Number(minutes);
  const occurredAt = new Date();

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes: Number(minutes),
    points,
    occurredAt,
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = input as Record<string, unknown>;
  const { name, mascot, members } = body;

  if (!name) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const team = await Team.create({
    name,
    mascot: mascot ?? '',
    members: Array.isArray(members) ? members : [],
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const results = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    { $sort: { totalPoints: -1 } },
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: '_id',
        as: 'teamInfo',
      },
    },
    { $unwind: '$teamInfo' },
    {
      $project: {
        _id: 0,
        teamName: '$teamInfo.name',
        totalPoints: 1,
      },
    },
  ]);

  return results.map((entry: { teamName: string; totalPoints: number }, index: number) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const decodedEmail = decodeURIComponent(userEmail);
  const user = await User.findOne({ email: decodedEmail });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  // Find user's recent activities to determine patterns
  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();

  // Determine focus from user's fitnessGoal or recent activity
  const focus = user.fitnessGoal ?? 'general';

  // Find matching workouts sorted by focus relevance
  const matchingWorkouts = await Workout.find({ focus }).lean();
  const otherWorkouts = await Workout.find({ focus: { $ne: focus } }).lean();

  const allWorkouts = [...matchingWorkouts, ...otherWorkouts];

  // Build reason based on recent activities and goal
  const recentType = recentActivities.length > 0 ? recentActivities[0].type : null;

  return allWorkouts.map((workout) => ({
    ...workout,
    reason: workout.focus === focus
      ? `Matches your ${focus} goal${recentType ? ` and recent ${recentType} activity` : ''}`
      : `Diversify your training beyond ${focus}`,
  }));
}

export { User };
