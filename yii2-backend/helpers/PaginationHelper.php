<?php
namespace app\helpers;

use Yii;
use yii\db\ActiveQuery;

class PaginationHelper
{
    /**
     * Apply pagination to a query and return the paginated results with metadata
     * 
     * @param ActiveQuery $query The query to paginate
     * @param int $defaultPageSize Default number of items per page
     * @return array Array containing the paginated results and pagination metadata
     */
    public static function paginate(ActiveQuery $query, int $defaultPageSize = 21): array
    {
        $page = (int)Yii::$app->request->get('page', 1);
        $pageSize = (int)Yii::$app->request->get('page_size', $defaultPageSize);

        $totalCount = $query->count();
        $totalPages = ceil($totalCount / $pageSize);

        $results = $query->offset(($page - 1) * $pageSize)
            ->limit($pageSize)
            ->asArray()
            ->all();

        return [
            'results' => $results,
            'pagination' => [
                'total_count' => $totalCount,
                'page_count' => $totalPages,
                'current_page' => $page,
                'page_size' => $pageSize
            ]
        ];
    }

    /**
     * Get pagination parameters from request
     * 
     * @param int $defaultPageSize Default number of items per page
     * @return array Array containing page and page_size
     */
    public static function getPaginationParams(int $defaultPageSize = 21): array
    {
        return [
            'page' => (int)Yii::$app->request->get('page', 1),
            'page_size' => (int)Yii::$app->request->get('page_size', $defaultPageSize)
        ];
    }
} 